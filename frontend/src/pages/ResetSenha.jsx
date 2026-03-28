import { useNavigate, useSearchParams } from "react-router-dom";
import { Glass } from "../components/GlassContainer";
import { useState, useMemo } from "react";
import { solicitarResetSenha, confirmarResetSenha } from "../services/authService";

export default function ResetSenha() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = useMemo(() => searchParams.get('token'), [searchParams]);

    const [senhanova, setSenhanova] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(""); 

    const handleRequestLink = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage("")

        try {
        await solicitarResetSenha(email)
        setMessage("Link enviado com sucesso! Verifique seu e-mail.")
        } catch (err) {
        setMessage(err.response?.data?.message || err.message)
        } finally {
        setIsLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (senhanova !== confirmPassword) {
        setMessage("As senhas não coincidem.")
        return
        }

        setIsLoading(true)
        setMessage("")

        try {
            await confirmarResetSenha({ token, senhanova })
            setMessage("Senha alterada com sucesso! Redirecionando...")
            setTimeout(() => navigate("/login"), 2500)
        } catch (err) {
            setMessage(err.response?.data?.message || err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className='bg-[#0A0A0A] min-h-screen overflow-x-hidden relative flex items-center justify-center font-sans text-white'>
                <div className='absolute z-0 -top-40 -right-20 w-125 h-125 bg-[#00FFFF]/70 rounded-full blur-[200px]'></div>
                
                <div className="justify-items-center w-[90%] max-w-md h-auto z-10">
                    <div className="relative w-full">
                        <Glass cornerRadius="40px" blur="16px" bgOpacity={0.15}>
                            <div className="p-7 pt-13">
                                <h1 className="flex justify-center text-center font-bold text-3xl mb-8">
                                    {token ? "Nova Senha" : "Redefinir Senha"}
                                </h1>

                                {token ? (
                                    <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
                                        <input 
                                            className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                            placeholder="Nova senha"
                                            type="password"
                                            value={senhanova}
                                            onChange={(e) => setSenhanova(e.target.value)}
                                            required
                                        />
                                        <input 
                                            className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                            placeholder="Confirme a nova senha"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        {message && <p className="text-sm text-center text-[#00FFFF]">{message}</p>}
                                        <button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="mt-4 w-full h-12 rounded-full bg-[#AA00FF] font-bold hover:shadow-[0_0_15px_rgba(170,0,255,0.4)] disabled:opacity-50"
                                        >
                                            {isLoading ? "Salvando..." : "Alterar Senha"}
                                        </button>
                                    </form>
                                ) : (
                                    <form className="flex flex-col gap-4" onSubmit={handleRequestLink}>
                                        <input 
                                            className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                            placeholder="Digite seu e-mail cadastrado"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        {message && <p className="text-sm text-center text-[#00FFFF]">{message}</p>}
                                        <button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="mt-4 w-full h-12 rounded-full bg-[#AA00FF] font-bold disabled:opacity-50"
                                        >
                                            {isLoading ? "Enviando..." : "Enviar link"}
                                        </button>
                                    </form>
                                )}

                                <div className="mt-6 flex justify-center">
                                    <a href="/login" className="text-[#E0E0E0]/70 text-sm hover:text-white transition-colors">
                                        Voltar para o login
                                    </a>
                                </div>
                            </div>
                        </Glass>
                    </div>
                </div>
            </div>
        </>
    )
}