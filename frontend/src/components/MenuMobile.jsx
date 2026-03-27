import { useState, useEffect } from "react";
import { Glass } from "./GlassContainer";
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../hooks/useAuth";

export function MobileMenu({ isOpen, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login')
  }

  // Função para fechar com animação
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
      <>
        {isOpen && (
            <>
              <div
                  onClick={handleClose}
                  className={`fixed inset-0 bg-black/30 z-50 lg:hidden ${
                      isClosing ? "fade-out" : "fade-in"
                  }`}
              />

              {/* Menu lateral */}
              <nav
                  className={`fixed top-0 left-0 h-full  w-80 bg-[#0A0A0A] shadow-2xl z-50 lg:hidden overflow-y-auto ${
                      isClosing ? "slide-out" : "slide-in"
                  }`}
              >
                <div className="p-7">
                  {/* Logo aba lateral */}
                  <div className="mb-15 justify-center">
                    <div className="flex items-center gap-3 justify-self-center ">
                      <svg
                          width="43"
                          height="42"
                          viewBox="0 0 43 42"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                            d="M16.5623 10.0159C15.6637 10.1308 14.8826 10.4425 14.1939 10.9757C13.6816 11.3612 13.69 11.353 11.456 14.1995C10.3726 15.5858 9.44041 16.7507 9.38162 16.7999C9.33123 16.8409 7.78592 17.2757 5.96346 17.7597C4.04022 18.2683 2.42772 18.744 2.12537 18.8835C1.11756 19.3593 0.302911 20.4175 0.0845512 21.5413C-0.0582222 22.2632 0.0173637 25.3394 0.193731 25.8397C0.496075 26.7093 1.18475 27.5296 1.9826 27.9808C2.46971 28.2515 3.34314 28.4647 3.97303 28.4647C4.32576 28.4647 4.39295 28.4894 4.43494 28.6452C4.46014 28.7519 4.62811 29.121 4.80447 29.4737C5.48475 30.778 6.7865 31.6968 8.34861 31.9593C9.02049 32.0741 9.18006 32.0741 9.86033 31.9593C11.4308 31.705 12.7494 30.778 13.4213 29.4655C13.5976 29.121 13.7656 28.7519 13.7908 28.6452L13.8412 28.4647H21.2486H28.656L28.7064 28.6452C28.7316 28.7519 28.8996 29.121 29.076 29.4737C29.7562 30.7862 31.0664 31.705 32.6369 31.9593C33.3172 32.0741 33.4767 32.0741 34.1486 31.9593C35.8871 31.664 37.3736 30.5073 37.9279 28.9979L38.1127 28.5058L38.9777 28.4565C39.4564 28.4237 40.0191 28.3581 40.2291 28.3007C41.3545 28.0054 42.4043 27.0046 42.8074 25.8397C42.9838 25.3558 43.0594 21.812 42.925 21.1476C42.7234 20.2288 42.1355 19.3183 41.4217 18.8343C41.2369 18.7112 40.2375 18.2272 39.2045 17.7679L37.3316 16.923L35.7275 14.4292C33.9638 11.6812 33.4011 11.0085 32.4521 10.5245C31.3435 9.9503 31.6963 9.97491 24.0201 9.9585C20.2072 9.9503 16.8562 9.97491 16.5623 10.0159ZM30.6465 11.7304C31.3183 11.8452 31.881 12.1159 32.3262 12.5671C32.5193 12.764 33.4431 14.1175 34.3838 15.5858L36.0886 18.2519L38.2135 19.2116C39.3808 19.7366 40.4306 20.2534 40.5398 20.3601C40.6574 20.4667 40.8506 20.7128 40.9681 20.9179C41.1949 21.287 41.1949 21.3034 41.2201 23.1163C41.2537 25.1507 41.1949 25.4706 40.7246 26.0284C40.3131 26.5124 39.8931 26.6847 39.0113 26.7257L38.2554 26.7585L38.1547 26.2417C37.8187 24.5108 36.2398 22.9769 34.3922 22.5995C33.6363 22.4437 33.166 22.4437 32.4017 22.5995C30.4785 23.0015 28.8828 24.5847 28.5972 26.3894L28.5385 26.7421H21.257H13.984L13.8832 26.2499C13.6312 24.9702 12.5646 23.6167 11.3385 23.0179C10.2551 22.5011 9.25564 22.3698 8.13025 22.5995C6.51775 22.9358 5.16561 24.0515 4.56932 25.5362C4.46014 25.7987 4.35096 26.1843 4.31736 26.3894L4.25857 26.7667L3.73787 26.7175C3.08279 26.6683 2.57889 26.414 2.20936 25.9382C1.79783 25.405 1.74744 25.1097 1.78104 23.264C1.80623 21.4183 1.86502 21.205 2.46131 20.6964C2.85604 20.3601 2.99881 20.3108 6.76131 19.3183C8.56697 18.8507 10.1543 18.3995 10.2887 18.3339C10.4482 18.2519 11.3385 17.1855 12.7158 15.4136C13.9084 13.8796 15.0086 12.5261 15.1513 12.4112C15.4957 12.1241 16.2095 11.8124 16.6967 11.7304C17.3013 11.6319 30.0082 11.6319 30.6465 11.7304ZM10.4062 24.4862C11.0025 24.7487 11.6828 25.405 11.9347 25.9628C12.6318 27.505 11.9767 29.2604 10.4314 29.9987C10.0031 30.2038 9.86033 30.2284 9.11287 30.2284C8.38221 30.2284 8.21424 30.2038 7.81111 30.0151C6.2658 29.3097 5.59393 27.505 6.291 25.971C6.62693 25.2163 7.52557 24.4944 8.37381 24.2812C8.91971 24.1499 9.84353 24.2401 10.4062 24.4862ZM34.6777 24.4862C35.9291 25.0358 36.6933 26.4386 36.4498 27.7429C36.181 29.1784 35.0556 30.171 33.6027 30.253C32.5025 30.3104 31.5871 29.9249 30.932 29.1128C30.3021 28.3335 30.109 27.103 30.4869 26.1515C30.8144 25.2983 31.7215 24.5108 32.6453 24.2812C33.1912 24.1499 34.115 24.2401 34.6777 24.4862Z"
                            fill="white"
                        />
                      </svg>
                      <h1 className="mt-2 text-white font-bold">ScraperCar</h1>
                    </div>
                  </div>

                  <div className="text-white justify-self-center">
                    <h1 className="font-bold text-2xl text-center mb-8">Painel</h1>

                    <div className="flex gap-2 mb-8">
                      <div className="w-3 h-3 bg-green-500 rounded-full self-center"></div>
                      <p className="mt-1">Monitorando</p>
                    </div>

                  </div>

                  {/* Links de navegação */}
                  <ul className="space-y-5 flex-row">
                    <li className="items-center">
                      <Glass
                          cornerRadius="9999px"
                          blur="16px"
                          bgOpacity={0.15}
                          borderOpacity={0.25}
                          brightness={1.1}
                          saturation={1.2}
                          shadowOpacity={0.2}
                      >
                        <a
                            href="/"
                            className="group self-center items-center flex gap-2 h-12  px-4 text-[#E0E0E0] hover:bg-[#E0E0E0] hover:text-[#0A0A0A] hover:font-bold rounded-lg transition-colors font-medium"
                            onClick={handleClose}
                        >
                          <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                              className="transition-colors"
                          >
                            <path
                                d="M16.1165 12.0751L15.2832 10.6917C15.1082 10.3834 14.9499 9.80008 14.9499 9.45842V7.35008C14.9499 5.39175 13.7999 3.70008 12.1415 2.90841C11.7082 2.14175 10.9082 1.66675 9.99154 1.66675C9.0832 1.66675 8.26654 2.15841 7.8332 2.93341C6.2082 3.74175 5.0832 5.41675 5.0832 7.35008V9.45842C5.0832 9.80008 4.92487 10.3834 4.74987 10.6834L3.9082 12.0751C3.57487 12.6334 3.49987 13.2501 3.7082 13.8167C3.9082 14.3751 4.3832 14.8084 4.99987 15.0167C6.61654 15.5667 8.31654 15.8334 10.0165 15.8334C11.7165 15.8334 13.4165 15.5667 15.0332 15.0251C15.6165 14.8334 16.0665 14.3917 16.2832 13.8167C16.4999 13.2417 16.4415 12.6084 16.1165 12.0751Z"
                                fill="currentColor"
                            />
                            <path
                                d="M12.3585 16.6751C12.0085 17.6417 11.0835 18.3334 10.0001 18.3334C9.34181 18.3334 8.69181 18.0667 8.23348 17.5917C7.96681 17.3417 7.76681 17.0084 7.65015 16.6667C7.75848 16.6834 7.86681 16.6917 7.98348 16.7084C8.17515 16.7334 8.37515 16.7584 8.57515 16.7751C9.05015 16.8167 9.53348 16.8417 10.0168 16.8417C10.4918 16.8417 10.9668 16.8167 11.4335 16.7751C11.6085 16.7584 11.7835 16.7501 11.9501 16.7251C12.0835 16.7084 12.2168 16.6917 12.3585 16.6751Z"
                                fill="currentColor"
                            />
                          </svg>
                          <span className="leading-none relative top-0.5">Meus Alertas</span>
                        </a>
                      </Glass>
                    </li>
                    <li className="">
                      <div className="">
                        <Glass
                            cornerRadius="9999px"
                            blur="16px"
                            bgOpacity={0.15}
                            borderOpacity={0.25}
                            brightness={1.1}
                            saturation={1.2}
                            shadowOpacity={0.2}
                        >
                          <a
                              href="/estoque"
                              className="group self-center items-center flex gap-2 h-12 px-4 text-[#E0E0E0] hover:bg-[#E0E0E0] hover:text-[#0A0A0A] hover:font-bold rounded-lg transition-colors font-medium"
                              onClick={handleClose}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                              <path d="M11.4416 2.92495L12.9083 5.85828C13.1083 6.26662 13.6416 6.65828 14.0916 6.73328L16.7499 7.17495C18.4499 7.45828 18.8499 8.69162 17.6249 9.90828L15.5583 11.975C15.2083 12.325 15.0166 13 15.1249 13.4833L15.7166 16.0416C16.1833 18.0666 15.1083 18.85 13.3166 17.7916L10.8249 16.3166C10.3749 16.05 9.63326 16.05 9.17492 16.3166L6.68326 17.7916C4.89992 18.85 3.81659 18.0583 4.28326 16.0416L4.87492 13.4833C4.98326 13 4.79159 12.325 4.44159 11.975L2.37492 9.90828C1.15826 8.69162 1.54992 7.45828 3.24992 7.17495L5.90826 6.73328C6.34992 6.65828 6.88326 6.26662 7.08326 5.85828L8.54992 2.92495C9.34992 1.33328 10.6499 1.33328 11.4416 2.92495Z" fill="currentColor"/>
                            </svg>

                            <span className="leading-none relative top-0.5">Anúncios Favoritos</span>
                          </a>
                        </Glass>
                      </div>
                    </li>
                    <li>
                      <Glass
                          cornerRadius="9999px"
                          blur="16px"
                          bgOpacity={0.15}
                          borderOpacity={0.25}
                          brightness={1.1}
                          saturation={1.2}
                          shadowOpacity={0.2}
                      >
                        <a
                            href="/vender"
                            className="group cursor-pointer flex items-center gap-2 py-3 px-4 text-[#E0E0E0] hover:bg-[#E0E0E0] hover:text-[#0A0A0A] hover:font-bold rounded-lg transition-colors font-medium"
                            onClick={handleClose}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                               className="transition-colors">
                            <path d="M6.68325 3.8501H5.81659C4.49159 3.8501 3.95825 4.3501 3.95825 5.61676V15.5168H8.54159V5.61676C8.53325 4.3501 7.99992 3.8501 6.68325 3.8501Z" fill="currentColor"/>
                            <path d="M13.7667 8.0166H12.9001C11.5751 8.0166 11.0417 8.52493 11.0417 9.78327V15.5166H15.6251V9.78327C15.6251 8.52493 15.0834 8.0166 13.7667 8.0166Z" fill="currentColor"/>
                            <path d="M2.29175 14.8999H17.7084C18.0501 14.8999 18.3334 15.1832 18.3334 15.5249C18.3334 15.8666 18.0501 16.1499 17.7084 16.1499H2.29175C1.95008 16.1499 1.66675 15.8666 1.66675 15.5166C1.66675 15.1666 1.95008 14.8999 2.29175 14.8999Z" fill="currentColor"/>
                          </svg>

                          <span className="leading-none relative top-0.5">Relatórios</span>
                        </a>
                      </Glass>
                    </li>
                    <li>
                      <Glass
                          cornerRadius="9999px"
                          blur="16px"
                          bgOpacity={0.15}
                          borderOpacity={0.25}
                          brightness={1.1}
                          saturation={1.2}
                          shadowOpacity={0.2}
                      >
                        <a
                            href="/sobre"
                            className="group cursor-pointer flex items-center gap-2 py-3 px-4 text-[#E0E0E0] hover:bg-[#E0E0E0] hover:text-[#0A0A0A] hover:font-bold rounded-lg transition-colors font-medium"
                            onClick={handleClose}
                        >
                          <svg className="w-5 h-5 transition-colors" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.0001 1.66675C5.40841 1.66675 1.66675 5.40841 1.66675 10.0001C1.66675 14.5917 5.40841 18.3334 10.0001 18.3334C14.5917 18.3334 18.3334 14.5917 18.3334 10.0001C18.3334 5.40841 14.5917 1.66675 10.0001 1.66675ZM13.6251 12.9751C13.5084 13.1751 13.3001 13.2834 13.0834 13.2834C12.9751 13.2834 12.8667 13.2584 12.7667 13.1917L10.1834 11.6501C9.54175 11.2667 9.06675 10.4251 9.06675 9.68341V6.26675C9.06675 5.92508 9.35008 5.64175 9.69175 5.64175C10.0334 5.64175 10.3167 5.92508 10.3167 6.26675V9.68341C10.3167 9.98341 10.5667 10.4251 10.8251 10.5751L13.4084 12.1167C13.7084 12.2917 13.8084 12.6751 13.6251 12.9751Z" fill="currentColor"/>
                          </svg>
                          <span className="leading-none relative top-0.5">Histórico de Anúncios</span>
                        </a>
                      </Glass>
                    </li>
                  </ul>

                  <span className="mt-15 text-white hover:text-[#AA00FF] cursor-pointer transition-all flex justify-center" onClick={handleLogout}>Logout</span>


                  {/* Status*/}
                  <div className="text-center space-y-3 mt-30">
                    <h2 className="text-white text-xl gap-4">Status</h2>
                    <div className="flex gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full self-center"></div>
                        <span className="text-white leading-none relative top-0.5">Backend</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full self-center"></div>
                        <span className="text-white leading-none relative top-0.5">Scraper</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full self-center"></div>
                        <span className="text-white leading-none relative top-0.5">WPP API</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full self-center"></div>
                      <span className="text-white leading-none relative top-0.5">Online</span>
                      <div className="w-3 h-3 bg-red-500 rounded-full self-center"></div>
                      <span className="text-white leading-none relative top-0.5">Offline</span>
                    </div>
                  </div>

                  <div className="mt-8 text-center text-sm text-gray-400 space-y-2">
                    <p>ScraperCar 2026 - Desenvolvido por</p>
                    <div className="justify-self-center ">
                      <a className="flex gap-2" href="https://github.com/Augustbr01/">
                        <svg height="22" fill="#FFFFFF" aria-hidden="true" viewBox="0 0 24 24" version="1.1" width="22" data-view-component="true" class="octicon octicon-mark-github">
                          <path d="M10.303 16.652c-2.837-.344-4.835-2.385-4.835-5.028 0-1.074.387-2.235 1.031-3.008-.279-.709-.236-2.214.086-2.837.86-.107 2.02.344 2.708.967.816-.258 1.676-.386 2.728-.386 1.053 0 1.913.128 2.686.365.666-.602 1.848-1.053 2.708-.946.3.581.344 2.085.064 2.815.688.817 1.053 1.913 1.053 3.03 0 2.643-1.998 4.641-4.877 5.006.73.473 1.224 1.504 1.224 2.686v2.235c0 .644.537 1.01 1.182.752 3.889-1.483 6.94-5.372 6.94-10.185 0-6.081-4.942-11.044-11.022-11.044-6.081 0-10.98 4.963-10.98 11.044a10.84 10.84 0 0 0 7.112 10.206c.58.215 1.139-.172 1.139-.752v-1.719a2.768 2.768 0 0 1-1.032.215c-1.418 0-2.256-.773-2.857-2.213-.237-.58-.495-.924-.989-.988-.258-.022-.344-.129-.344-.258 0-.258.43-.451.86-.451.623 0 1.16.386 1.719 1.181.43.623.881.903 1.418.903.537 0 .881-.194 1.375-.688.365-.365.645-.687.903-.902Z"></path>
                        </svg>
                        <span className="leading-none relative top-1.5">Augustbr01</span>
                      </a>
                    </div>
                  </div>
                </div>
              </nav>
            </>
        )}
      </>
  );
}
