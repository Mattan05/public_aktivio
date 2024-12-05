function NavBar() {

    return ( 
        <>
            <div className="navBar-container">
                <nav>
                    <ul className="navbar-ul-before">
                        <a href="#home"><li><span className="text-warning material-symbols-outlined">home</span></li></a>
{/*                         <a href="#favorites"><li><span className="material-symbols-outlined">favorite</span></li></a>
                        <a href="#create"><li className="create-btn"><span className="material-symbols-outlined">add</span></li></a>  */}
                        {/* <a href="#register"><li><span className="material-symbols-outlined">person_add</span></li></a> */}
{/*                         <a href="#login"><li><span className="material-symbols-outlined">login</span></li></a> */} { /* Om man är utloggad ska man komma till login eller register */}
                        <a href="#profile"><li><span className="text-warning material-symbols-outlined" /* alt="Profile-button" */>person</span></li></a>
                    </ul>
                </nav>
            </div>
        </>
     );
}

export default NavBar;