function Header() {
    /* const [searchVisible, setSearchVisible] = useState(false);
    const toggleSearch = () => {
        setSearchVisible(!searchVisible);
    } */
    return ( 
        
        <>
        <header>
            <a href="#home">
            <div className="wrapper-header d-flex">
                <div className="logo-container">
                    <img src="client/src/aktivio-images/logo.png" alt="Aktivio Logo" />
                </div>
                <h1 className="text-warning">Aktivio</h1>
            </div>
            
            </a>
           {/*  <nav className="header-nav">
                <a href="#home"> Home</a>
                <a href="#register"> Register</a>
                <a href="#login">Login</a>
            </nav> */}
        </header>
        </>
     );
}

export default Header;