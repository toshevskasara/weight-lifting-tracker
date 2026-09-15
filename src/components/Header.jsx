import weightLogo from '../assets/weightLogo.jpg'
import '../components/Header.css'

function Header(){

    return(
        <header>
            <nav className="navbar bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                <img src={weightLogo} alt="Logo" width="40" height="30" className="d-inline-block align-text-top"/>
                    Weight Lifting Tracker
                </a>
            </div>
            </nav>
            <hr></hr>
        </header>
    );
}

export default Header