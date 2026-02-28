# 🚗 ShopCar Scraper & Alerta WhatsApp

Um sistema automatizado em Python desenvolvido para raspar (scrape) ofertas específicas de veículos no site [ShopCar](https://www.shopcar.com.br/), registrar o histórico e enviar notificações diretamente para o WhatsApp sempre que um novo anúncio for publicado.

Ideal para encontrar os melhores negócios de carros usados sem precisar checar o site manualmente todos os dias.

## ⚙️ Funcionalidades

- **Scraping Customizado:** Busca carros filtrando por marca, modelo, versão, ano e quilometragem máxima.
- **Múltiplas Buscas:** Capacidade de buscar diversos modelos de forma simultânea (ex: HB20 e Onix na mesma rotina).
- **Notificações via WhatsApp:** Integração com **WPPConnect** para envio automático de mensagens formatadas com os detalhes do carro (ano, km, valor e link).
- **Múltiplos Destinatários:** Envia o alerta para mais de um número de WhatsApp configurado.
- **Sistema Anti-Duplicidade:** Armazena um banco de dados local (`historico.json`) para garantir que você só receba notificações de anúncios genuinamente novos.
- **Exportação de Dados:** Salva todos os anúncios validados em uma planilha (`ofertas.csv`) para análise posterior.
- **Automação 24/7:** Execução agendada por intervalos regulares (ex: a cada 1 hora) rodando em background com `pm2`.

## 🛠️ Tecnologias Utilizadas

- **[Python 3](https://www.python.org/)** (Lógica principal)
- **[BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/) & [Requests](https://pypi.org/project/requests/)** (Extração de dados HTML)
- **[Schedule](https://pypi.org/project/schedule/)** (Agendamento de tarefas)
- **[Python-dotenv](https://pypi.org/project/python-dotenv/)** (Gerenciamento de variáveis de ambiente)
- **[WPPConnect Server](https://github.com/wppconnect-team/wppconnect-server)** (API REST em Node.js para envio de WhatsApp)
- **[PM2](https://pm2.keymetrics.io/)** (Gerenciamento de processos em background)

---

## 🚀 Como instalar e rodar localmente

### 1. Pré-requisitos
Certifique-se de ter instalado na sua máquina:
- Python 3.x
- Node.js (para o gerenciamento de pacotes do WhatsApp)
- **[WPPConnect Server](https://github.com/wppconnect-team/wppconnect-server):** Um servidor de API REST para WhatsApp. Ele precisa estar instalado e rodando em sua máquina para que o envio de mensagens funcione.

> **Nota sobre o WPPConnect:** Você deve clonar e configurar o WPPConnect Server localmente seguindo as [instruções oficiais deles](https://github.com/wppconnect-team/wppconnect-server#installation). Lembre-se de escanear o QR Code no seu navegador e gerar o token de segurança (`Bearer Token`) que será usado no `.env` deste projeto.

### 2. Clonar este repositório
```bash
git clone https://github.com/SeuUsuario/ShopcarSearch.git
cd ShopcarSearch
```

### 3. Configurar o Python
Crie um ambiente virtual (opcional, mas recomendado) e instale as dependências:
```bash
pip install requests beautifulsoup4 schedule python-dotenv
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto contendo as chaves do WPPConnect e os números de destino (incluindo código do país e DDD, sem símbolos):

```env
WPPCONNECT_URL=http://localhost:21465
WPPCONNECT_SESSION=SUA_SESSAO
WPPCONNECT_TOKEN=SEU_TOKEN_GERADO

DEST_PHONE1=5567999999999
DEST_PHONE2=5567888888888
```

### 5. Configurar os Modelos de Busca
No arquivo `modelosBusca.json`, edite ou adicione modelos com os parâmetros dos carros desejados. *Dica: faça uma busca no site do ShopCar e copie os códigos dos parâmetros pela URL gerada.*

### 6. Executando manualmente
Para testar se tudo está funcionando:
```bash
python index.py
```

---

## 🔄 Rodando em Segundo Plano (Background no Windows)

Para manter o script e a API de WhatsApp rodando de forma invisível e iniciando junto com o Windows, utilizamos o PM2.

### Passo 1: Instalar o PM2 e o suporte de inicialização no Windows
Abra o terminal (como Administrador) e instale os pacotes globais:
```bash
npm install pm2 -g
npm install pm2-windows-startup -g
pm2-startup install
```

### Passo 2: Iniciar os processos
**1. Iniciar o servidor WPPConnect:**

Para inicializar o wppconnect recomendo 

```bash
# Na pasta do seu servidor wppconnect
npm run build
```

```bash
pm2 start dist/server.js --name "wppconnect"
```

```bash
# Para verificar se esta rodando
pm2 logs wppconnect
```

```bash
# Para salvar
pm2 save
```

**2. Iniciar o Scraper Python:**
*(A flag `-X utf8` previne erros de codificação de emojis nos logs do Windows)*
```bash
# Na pasta do ShopcarSearch
pm2 start index.py --name "shopcar-scraper" --interpreter python --interpreter-args "-X utf8"
```

### Passo 3: Salvar para auto-inicialização
```bash
pm2 save
```

Pronto! Agora ambos os processos iniciarão sozinhos sempre que o PC for ligado.
Para acompanhar os logs:
```bash
pm2 logs shopcar-scraper
```

---

## 📝 Licença

Desenvolvido para fins de estudo e uso pessoal.
