import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import '../components/Signup.css'
import Loading from './Loading.jsx';

import emailLogo from '../assets/mail.png'
import passwordLogo from '../assets/key.png'
import userLogo from '../assets/user.png'



function Signup() {
    const [action, setAction] = useState("Sign Up");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);

        if(action==="Sign Up"){
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {full_name: name}
                }
            });

            if(error){
                alert(error.message);
            }
            else{
                alert("Sign Up Successful! Please go to Login page.");
            }
        }
        else{
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if(error){
                alert(error.message);
            }
            else{
                navigate('/');
            }
        }

        setLoading(false);
    };

    return(
        <div className='container'>
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>
            <div className="inputs">
                {action==="Login"?<div></div>:
                    <div className="input">
                        <img src={userLogo} alt="User Logo" className="input-icon" />
                        <input 
                           type="text" 
                           placeholder="Name & Surname"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                        ></input>
                    </div>
                }
                
                <div className="input">
                    <img src={emailLogo} alt="Email Logo" className="input-icon" />
                    <input 
                       type="email" 
                       placeholder="Email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                    ></input>
                </div>
                <div className="input">
                    <img src={passwordLogo} alt="Password Logo" className="input-icon" />
                    <input 
                       type="password" 
                       placeholder="Password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                    ></input>
                </div>
            </div>
            
            <div className="form-container">
                {action==="Login"?(
                    <>
                    <div className="divider">Not registered yet?</div>
                    <div className="forms" onClick={() => setAction("Sign Up")}>Sign Up</div>
                    </>
                ) : (
                    <>
                    <div className="divider">Already have an account?</div>
                    <div className="forms" onClick={() => setAction("Login")}>Login</div>
                    </>
                )}
                 </div>

            <div className="submit-container">
                <button onClick={handleSubmit} disabled={loading} className="submit">
                    {loading ? <Loading/> : action}
                </button>
            </div>
        </div>
    );
}

export default Signup;