import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export function useAlertas() {
    const [alertas, setAlertas] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)

    // Busca todos os alertas do usuário
    const fetchAlertas = useCallback(async () => {
        setCarregando(true)
        setErro(null)
        try {
            const { data } = await api.get('/alerts')
            setAlertas(data)
        } catch (err) {
            setErro(err.response?.data?.message || 'Erro ao carregar alertas.')
        } finally {
            setCarregando(false)
        }
    }, [])

    // Cria um novo alerta
    const criarAlerta = useCallback(async (payload) => {
        const { data } = await api.post('/alerts/create', payload)
        // Recarrega a lista após criar
        await fetchAlertas()
        return data
    }, [fetchAlertas])

    // Deleta um alerta pelo id
    const deletarAlerta = useCallback(async (id) => {
        await api.delete(`/alerts/${id}`)
        // Remove localmente sem precisar rebuscar
        setAlertas(prev => prev.filter(a => a.id !== id))
    }, [])

    // Pausa ou retoma um alerta (toggle)
    const toggleAlerta = useCallback(async (id) => {
        const { data } = await api.patch(`/alerts/toggle/${id}`)
        // Inverte o campo `ativo` localmente
        setAlertas(prev =>
            prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a)
        )
        // Retorna a mensagem do backend ("Alerta pausado..." / "Alerta ativado...")
        return data
    }, [])

    useEffect(() => {
        fetchAlertas()
    }, [fetchAlertas])

    return {
        alertas,
        carregando,
        erro,
        fetchAlertas,
        criarAlerta,
        deletarAlerta,
        toggleAlerta,
    }
}