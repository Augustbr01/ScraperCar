import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ShopCar Scraper", version="1.0.0")

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
        "dataEncontrado": datetime.now().strftime("%d/%m/%Y %H:%M"),  # ← camelCase
    }

# ── SCRAPER ────────────────────────────────────────────────────────────────────

async def buscar_anuncios(busca: dict) -> list[dict]:
    params = montar_params(busca)
    nome   = busca.get("nome")

    logger.info(f"Buscando: {params}")

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15) as client:
            resp = await client.get(BASE_URL, params=params)
            resp.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Erro ao acessar ShopCar: {e}")

    soup     = BeautifulSoup(resp.text, "html.parser")
    anuncios = []

    for item in soup.select("ul.itens"):
        if not item.select_one("a.link"):
            continue
        anuncio = extrair_anuncio(item, nome)
        anuncios.append(anuncio)

    logger.info(f"Encontrados: {len(anuncios)} anúncios")
    return anuncios

# ── ROTAS ──────────────────────────────────────────────────────────────────────

@app.post("/buscar")
async def buscar(busca: BuscaRequest):
    busca_dict = busca.model_dump(exclude_none=True)
    lista      = await buscar_anuncios(busca_dict)
    return {"total": len(lista), "resultado": lista}