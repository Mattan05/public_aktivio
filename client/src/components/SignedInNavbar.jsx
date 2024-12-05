function SignedInNavbar() {
    return ( 
        <>
            <div className="navBar-container">{/* rounded-pill */}
                <nav>
                    <ul className="navbar-ul">
                        <a href="#home"><li><span className="text-warning rounded-circle material-symbols-outlined">home</span></li></a>
                        <a href="#favorites"><li><span className="text-warning rounded-circle material-symbols-outlined">favorite</span></li></a>
                        <a href="#create"><li className="create-btn"><span className="bg-warning rounded-circle material-symbols-outlined">add</span></li></a>
                        <a href="#message"><li><span className="text-warning rounded-circle material-symbols-outlined">mail</span></li></a>
                        <a href="#profile"><li><span className="text-warning rounded-circle material-symbols-outlined">person</span></li></a> {/* Om man är utloggad ska man komma till login eller register */}
                    </ul>
                </nav>
            </div>
        </>
     );
}

export default SignedInNavbar;