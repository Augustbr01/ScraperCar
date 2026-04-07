import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ShopCar Scraper", version="1.1.0")

# ── CONFIGURAÇÃO ───────────────────────────────────────────────────────────────

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
BASE_URL = "https://www.shopcar.com.br/busca.php"

# ── SCHEMAS ────────────────────────────────────────────────────────────────────

class BuscaRequest(BaseModel):
    nome: str | None = None
    tipo: int | None = None
    marca: int | None = None
    string: str | None = None
    versao: str | None = None
    valorinicio: float | None = None
    valorfim: float | None = None
    faixaano1: int | None = None
    faixaano2: int | None = None
    kminicio: str | None = None
    kmfim: str | None = None

# ── HELPERS ────────────────────────────────────────────────────────────────────

def formatar_valor(v: float) -> str:
    return f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def extrair_preco(texto: str) -> float | None:
    if not texto or "R$" not in texto:
        return None
    try:
        return float(
            texto.replace("R$", "").replace(".", "").replace(",", ".").strip()
        )
    except ValueError:
        return None


def montar_params(busca: dict) -> dict:
    params = {k: v for k, v in busca.items() if k != "nome"}

    if "valorinicio" in params:
        params["valorinicio"] = formatar_valor(float(params["valorinicio"]))
    if "valorfim" in params:
        params["valorfim"] = formatar_valor(float(params["valorfim"]))

    return params


def extrair_anuncio(item, nome: str | None) -> dict:
    def texto(seletor: str) -> str:
        el = item.select_one(seletor)
        return el.text.strip() if el else "N/A"

    link_tag = item.select_one("a.link")
    preco_num = extrair_preco(texto(".preco"))

    return {
        "busca":          nome,
        "id":             link_tag["href"].split("/")[-1],
        "modelo":         texto(".modelo"),
        "ano":            texto(".caract-anomodelo"),
        "cor":            texto(".caract-cor"),
        "combustivel":    texto(".caract-combust"),
        "km":             texto(".caract-km"),
        "preco":          preco_num,
        "cidade":         texto(".cidade"),
        "link":           link_tag["href"],
        "dataEncontrado": datetime.now().strftime("%d/%m/%Y %H:%M"),
    }


def extrair_total_paginas(soup: BeautifulSoup) -> int:
    """
    Detecta o número total de páginas disponíveis na busca.

    O ShopCar renderiza um <select name="pagina"> cujas <option> enumeram
    todas as páginas — a quantidade de options é exatamente o total de páginas.
    Fallback: inspeciona os links da paginação inferior (.paginacao a).
    """
    
    select = soup.select_one('select[name="pagina"]')
    if select:
        options = select.find_all("option")
        if options:
            return len(options)

    links = soup.select(".paginacao a")
    numeros = []
    for link in links:
        try:
            numeros.append(int(link.text.strip()))
        except ValueError:
            pass  # ignora "Próxima ›" e similares

    return max(numeros) if numeros else 1


def extrair_anuncios_da_pagina(soup: BeautifulSoup, nome: str | None) -> list[dict]:
    anuncios = []
    for item in soup.select("ul.itens"):
        if not item.select_one("a.link"):
            continue
        anuncios.append(extrair_anuncio(item, nome))
    return anuncios


# ── SCRAPER ────────────────────────────────────────────────────────────────────

async def buscar_pagina(
    client: httpx.AsyncClient,
    params: dict,
    pagina: int,
) -> BeautifulSoup:
    """Faz o GET de uma única página e retorna o BeautifulSoup."""
    params_paginados = {**params, "pagina": pagina}
    logger.info(f"Buscando página {pagina}: {params_paginados}")

    resp = await client.get(BASE_URL, params=params_paginados)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


async def buscar_anuncios(busca: dict) -> list[dict]:
    params = montar_params(busca)
    nome   = busca.get("nome")

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15) as client:

            soup_pg1   = await buscar_pagina(client, params, pagina=1)
            total_pgs  = extrair_total_paginas(soup_pg1)
            logger.info(f"Total de páginas encontradas: {total_pgs}")

            anuncios = extrair_anuncios_da_pagina(soup_pg1, nome)

            
            if total_pgs > 1:
                tarefas = [
                    buscar_pagina(client, params, pagina=pg)
                    for pg in range(2, total_pgs + 1)
                ]
                soups_restantes = await asyncio.gather(*tarefas)

                for soup in soups_restantes:
                    anuncios.extend(extrair_anuncios_da_pagina(soup, nome))

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Erro ao acessar ShopCar: {e}")

    logger.info(f"Total de anúncios coletados: {len(anuncios)}")
    return anuncios


# ── ROTAS ──────────────────────────────────────────────────────────────────────

@app.post("/buscar")
async def buscar(busca: BuscaRequest):
    busca_dict = busca.model_dump(exclude_none=True)
    lista      = await buscar_anuncios(busca_dict)
    return {"total": len(lista), "resultado": lista}

@app.get("/check")
async def check():
    return {"resultado": "Servidor ON"}
