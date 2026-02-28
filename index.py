import requests
from bs4 import BeautifulSoup
import json, os, schedule, time
from datetime import datetime
from dotenv import load_dotenv

import json
import os

load_dotenv()

# ── CONFIGURAÇÃO ──────────────────────────────────────────────

with open('modelosBusca.json', 'r', encoding='utf-8') as arquivo:
    
    BUSCAS = json.load(arquivo)

HISTORICO_PATH = "historico.json"
RESULTADO_PATH = "ofertas.csv"

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# ── SCRAPER ───────────────────────────────────────────────────
def buscar_anuncios(busca: dict):
    params = {k: v for k, v in busca.items() if k != "nome"}  
    resp = requests.get("https://www.shopcar.com.br/busca.php", params=params, headers=HEADERS, timeout=15)
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

# ── HISTÓRICO (evita duplicatas) ──────────────────────────────
def checar_novos(anuncios):
    if os.path.exists(HISTORICO_PATH):
        with open(HISTORICO_PATH) as f:
            vistos = set(json.load(f))
    else:
        vistos = set()

    novos = [a for a in anuncios if a["id"] not in vistos]
    vistos.update(a["id"] for a in novos)

    with open(HISTORICO_PATH, "w") as f:
        json.dump(list(vistos), f)
    return novos

# ── EXPORT CSV ────────────────────────────────────────────────
def salvar_csv(novos):
    import csv
    existe = os.path.exists(RESULTADO_PATH)
    with open(RESULTADO_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=novos[0].keys())
        if not existe:
            writer.writeheader()
        writer.writerows(novos)
    print(f"[✓] {len(novos)} novos anúncios salvos em {RESULTADO_PATH}")

# ── WHATSAPP via WPPConnect Server API (EXTERNA) ─────────────────────────
def notificar_whatsapp(novos, nome_busca):
    linhas = []
    for a in novos:
        linhas.append(
            f"📌 {a['modelo']} | {a['ano']}\n"
            f"🎨 {a['cor']} | ⛽ {a['combustivel']}\n"
            f"📍 {a['km']} | 💰 {a['preco']}\n"
            f"📍 {a['cidade']}\n"
            f"🔗 {a['link']}"
        )

    msg = f"🔔 *{nome_busca}*\n{len(novos)} novo(s) anuncio(s) encontrado(s):\n\n" + "\n\n--------------------------\n\n".join(linhas)

    url = f"{os.environ.get('WPPCONNECT_URL')}/api/{os.environ.get('WPPCONNECT_SESSION')}/send-message"
    headers = {
        "Authorization": f"Bearer {os.environ.get('WPPCONNECT_TOKEN')}",
        "Content-Type": "application/json"
    }
    destinatarios = [
        os.environ.get("DEST_PHONE1"),
        os.environ.get("DEST_PHONE2"),
     ]

    for numero in destinatarios:
        payload = {
            "phone": numero,
            "isGroup": False,
            "message": msg
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"  [WPP] {numero} → {resp.status_code} | {resp.json().get('message', '')}")
        time.sleep(5)


# ── JOB DIÁRIO ────────────────────────────────────────────────
def job():
    print(f"[{datetime.now()}] Iniciando busca em {len(BUSCAS)} modelos...")
    for busca in BUSCAS:
        print(f"  → Buscando: {busca['nome']}")
        try:
            anuncios = buscar_anuncios(busca)
            novos = checar_novos(anuncios)
            if novos:
                salvar_csv(novos)
                notificar_whatsapp(novos, busca["nome"])  
            else:
                print(f"     Nenhum novo anúncio.")
        except Exception as e:
            print(f"     [ERRO] {e}")
        time.sleep(10)

# ── AGENDAMENTO ───────────────────────────────────────────────
if __name__ == "__main__":
    job()  
    schedule.every(1).hours.do(job) ## Aqui define o tempo de intervalo de cada verificação
    while True:
        schedule.run_pending()
        time.sleep(60)
