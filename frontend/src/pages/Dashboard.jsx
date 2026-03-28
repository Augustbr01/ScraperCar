import { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { useAlertas } from '../hooks/useAlertas'
import { CardAlerta } from '../components/Cardalerta'
import { ModalNovoAlerta } from '../components/ModalNovoAlerta'
import { ModalGerenciarAlerta } from '../components/Modalgerenciaralerta'
import { Toast } from '../components/Toast'

function Dashboard() {
    // ─── Estado dos modais ─────────────────────────────────────────────────────
    const [modalCriarAberto, setModalCriarAberto] = useState(false)
    const [alertaSelecionado, setAlertaSelecionado] = useState(null) // objeto do alerta

    // ─── Toast ─────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState({ mensagem: '', tipo: 'sucesso' })

    const mostrarToast = useCallback((mensagem, tipo = 'sucesso') => {
        setToast({ mensagem, tipo })
    }, [])

    const fecharToast = useCallback(() => {
        setToast({ mensagem: '', tipo: 'sucesso' })
    }, [])

    // ─── Hook de alertas ───────────────────────────────────────────────────────
    const { alertas, carregando, erro, criarAlerta, deletarAlerta, toggleAlerta } = useAlertas()

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleCriar = useCallback(async (payload) => {
        try {
            await criarAlerta(payload)
            mostrarToast('O Alerta foi criado com sucesso!', 'sucesso')
        } catch (err) {
            const msg = err.response?.data?.message || 'Ocorreu um erro ao salvar os dados'
            mostrarToast(msg, 'erro')
            throw err // re-lança para o modal não fechar
        }
    }, [criarAlerta, mostrarToast])

    const handleToggle = useCallback(async (id) => {
        try {
            const mensagem = await toggleAlerta(id)
            // Backend retorna string diretamente
            mostrarToast(typeof mensagem === 'string' ? mensagem : 'Status atualizado!', 'sucesso')
        } catch (err) {
            const msg = err.response?.data?.message || 'Ocorreu um erro ao atualizar o alerta'
            mostrarToast(msg, 'erro')
            throw err
        }
    }, [toggleAlerta, mostrarToast])

    const handleDeletar = useCallback(async (id) => {
        try {
            await deletarAlerta(id)
            mostrarToast('Alerta removido com sucesso.', 'sucesso')
        } catch (err) {
            const msg = err.response?.data?.message || 'Ocorreu um erro ao remover o alerta'
            mostrarToast(msg, 'erro')
            throw err
        }
    }, [deletarAlerta, mostrarToast])

    // ─── Renderização ──────────────────────────────────────────────────────────
    return (
        <section style={{ minHeight: '100vh', background: '#0A0A0A', position: 'relative', overflowX: 'hidden' }}>
            {/* Glow de fundo — mesmo padrão das outras páginas */}
            <div style={{
                position: 'absolute', top: -160, right: -80,
                width: 500, height: 500,
                background: 'rgba(0,255,255,0.2)',
                borderRadius: '50%',
                filter: 'blur(120px)',
                pointerEvents: 'none',
                zIndex: 0,
            }} />
            <div style={{
                position: 'absolute', bottom: -100, left: -80,
                width: 400, height: 400,
                background: 'rgba(170,0,255,0.05)',
                borderRadius: '50%',
                filter: 'blur(120px)',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            <Navbar />

            {/* Conteúdo principal — padding-top para não colidir com a navbar fixa */}
            <div style={{
                position: 'relative', zIndex: 1,
                maxWidth: 600,
                margin: '0 auto',
                padding: '100px 20px 100px',
            }}>

                {/* Título da página */}
                <h1 style={{
                    color: '#fff',
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: 28,
                    textAlign: 'center',
                }}>
                    Meus alertas
                </h1>

                {/* Estados de carregamento / erro / vazio */}
                {carregando && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                height: 80,
                                borderRadius: 18,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }} />
                        ))}
                    </div>
                )}

                {!carregando && erro && (
                    <div style={{
                        textAlign: 'center', color: '#ef4444',
                        padding: '40px 20px', fontSize: 14,
                    }}>
                        {erro}
                    </div>
                )}

                {!carregando && !erro && alertas.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255,255,255,0.3)',
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Nenhum alerta ainda</p>
                        <p style={{ fontSize: 13 }}>Crie seu primeiro alerta clicando no botão abaixo.</p>
                    </div>
                )}

                {/* Lista de alertas */}
                {!carregando && !erro && alertas.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {alertas.map(alerta => (
                            <CardAlerta
                                key={alerta.id}
                                alerta={alerta}
                                onClick={() => setAlertaSelecionado(alerta)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Botão flutuante para criar novo alerta */}
            <button
                onClick={() => setModalCriarAberto(true)}
                style={{
                    position: 'fixed',
                    bottom: 32, right: 24,
                    width: 56, height: 56,
                    borderRadius: 9999,
                    background: '#AA00FF',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 24px rgba(170,0,255,0.4)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    zIndex: 50,
                }}
                title="Criar novo alerta"
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(170,0,255,0.6)'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(170,0,255,0.4)'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
            </button>

            {/* Animação de skeleton */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

            {/* ─── Modais ─────────────────────────────────────────────────────────── */}
            <ModalNovoAlerta
                aberto={modalCriarAberto}
                onFechar={() => setModalCriarAberto(false)}
                onCriar={handleCriar}
            />

            <ModalGerenciarAlerta
                alerta={alertaSelecionado}
                onFechar={() => setAlertaSelecionado(null)}
                onToggle={handleToggle}
                onDeletar={handleDeletar}
            />

            {/* ─── Toast ──────────────────────────────────────────────────────────── */}
            <Toast
                mensagem={toast.mensagem}
                tipo={toast.tipo}
                onFechar={fecharToast}
            />
        </section>
    )
}

export default Dashboard