/**
 * CardAlerta — exibe um alerta na lista do dashboard
 * Props:
 *   alerta     — objeto do alerta
 *   onClick    — abre o modal de gerenciamento
 */
export function CardAlerta({ alerta, onClick }) {
    const descricao = [
        alerta.nomeMarca,
        alerta.versao,
    ].filter(Boolean).join(' ')

    const periodo = alerta.anoMin && alerta.anoMax
        ? `${alerta.anoMin} – ${alerta.anoMax}`
        : null

    const preco = alerta.valorinicio || alerta.valorfim
        ? [
            alerta.valorinicio ? `R$ ${Number(alerta.valorinicio).toLocaleString('pt-BR')}` : null,
            alerta.valorfim ? `R$ ${Number(alerta.valorfim).toLocaleString('pt-BR')}` : null,
        ].filter(Boolean).join(' – ')
        : null

    return (
        <button
            onClick={onClick}
            className={[
                'w-full rounded-[18px] px-4.5 py-4 h-auto cursor-pointer text-left',
                'transition-all duration-200',
                'flex flex-col gap-2 relative overflow-hidden',
                'border hover:bg-white/9',
                alerta.ativo
                    ? 'bg-white/6 border-white/10'
                    : 'bg-white/3 border-white/5',
            ].join(' ')}
        >
            {/* Linha superior: nome + badge de status */}
            <div className="flex items-start justify-between gap-2">
                <span className={[
                    'font-bold text-md leading-[1.4] h-2 mt-2 flex-1',
                    alerta.ativo ? 'text-white' : 'text-[#888]',
                ].join(' ')}>
                    {descricao}
                </span>

                {/* Badge ativo/pausado */}
                <span className={[
                    'shrink-0 h-5 mt-1 text-[10px] font-semibold px-2 py-0.75 rounded-full border',
                    alerta.ativo
                        ? 'bg-green-500/15 text-green-500 border-green-500/30'
                        : 'bg-white/8 text-[#888] border-white/10',
                ].join(' ')}>
                    {alerta.ativo ? '● Ativo' : '⏸ Pausado'}
                </span>
            </div>

            {/* Infos secundárias */}
            <div className="flex mt-5 flex-wrap gap-x-3 gap-y-1">
                {periodo && (
                    <span className="text-[#888] text-sm">
                        🗓 {periodo}
                    </span>
                )}
                {preco && (
                    <span className="text-[#888] text-sm">
                        💰 {preco}
                    </span>
                )}
                {alerta.kmfim && (
                    <span className="text-[#888] text-sm">
                        🛣 até {Number(alerta.kmfim).toLocaleString('pt-BR')} km
                    </span>
                )}
                {alerta.intervaloAlerta && (
                    <span className="text-[#888] text-sm">
                        ⏱ a cada {alerta.intervaloAlerta} min
                    </span>
                )}
            </div>
        </button>
    )
}