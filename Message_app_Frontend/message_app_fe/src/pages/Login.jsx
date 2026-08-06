import { useState } from "react";
import {Link, useNavigate} from "react-router-dom"
import API from "../services/api"

function Login(){
    const navigate= useNavigate();

    const [form,setForm]= useState({
        username:"",
        password:"",
    });

    const[message, setMessage]= useState("");

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]:e.target.value,
        });
        
    }

    async function handleLogin(e) {
            e.preventDefault();
       try{ 
        const response= await API.post("/auth/login",form);

        const data= response.data;

        localStorage.setItem("token",data.token);
        localStorage.setItem("username",data.username);
        localStorage.setItem("email",data.email);

        setMessage("Login successful");

        navigate("/dashboard");

        }catch(error){
        console.log(error);
        setMessage(
            error.response?.data?.message||
            error.response?.data ||
            "Login failed"
        );
    }
    }

    return(
        <div style={styles.page}>
            <div style={styles.card}>
                <h2>Login</h2>

                <form onSubmit={handleLogin} style={styles.form}>
                    <input 
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    />

                    <input 
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    />

                    <button type="submit" style={styles.button}>Login</button>
                </form>

                {message && <p style={styles.message}>{message}</p>}


                <p>
                    New user? <Link to="/register">Create account</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
  },
  card: {
    width: "380px",
    padding: "25px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
  },
  message: {
    marginTop: "12px",
  },
};

export default Login;