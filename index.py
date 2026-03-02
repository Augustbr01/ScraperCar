import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

app = FastAPI()

# ── CONFIGURAÇÃO ──────────────────────────────────────────────

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

class BuscaRequest(BaseModel):
    nome: str
    tipo: int | None = None
    marca: int | None = None
    string: str | None = None
    versao: str | None = None
    faixaano1: int | None = None
    faixaano2: int | None = None
    kminicio: str | None = None
    kmfim: str | None = None

# ── SCRAPER ───────────────────────────────────────────────────

@app.post("/buscar")
async def buscar(busca: BuscaRequest):
    busca_dict = busca.model_dump(exclude_none=True)

    lista = await buscar_anuncios(busca_dict)

    return {"Total": len(lista), "Resultado": lista}


async def buscar_anuncios(busca: dict):
    params = {k: v for k, v in busca.items() if k != "nome"}
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15) as client:
            resp = await client.get("https://www.shopcar.com.br/busca.php", params=params)
            resp.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Erro ao acessar ShopCar: {e}")
        

    soup = BeautifulSoup(resp.text, "html.parser")
    anuncios = []
    for item in soup.select("ul.itens"):
        link_tag = item.select_one("a.link")
        if not link_tag:
            continue

        def texto(seletor):
            el = item.select_one(seletor)
            return el.text.strip() if el else "N/A"

        anuncios.append({
            "busca":       busca["nome"], 
            "id":          link_tag["href"].split("/")[-1],
            "modelo":      texto(".modelo"),
            "ano":         texto(".caract-anomodelo"),
            "cor":         texto(".caract-cor"),
            "combustivel": texto(".caract-combust"),
            "km":          texto(".caract-km"),
            "preco":       texto(".preco"),
            "cidade":      texto(".cidade"),
            "link":        link_tag["href"],
            "data_encontrado": datetime.now().strftime("%d/%m/%Y %H:%M"),
        })

    return anuncios

