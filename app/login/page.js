"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you would have proper authentication
    if (username === "manager" && password === "password") {
      router.push("/manager");
    } else if (username === "kitchen" && password === "password") {
      router.push("/kitchen");
    } else if (username === "orb" && password === "password") {
      router.push("/orb");
    } else if (username === "owner" && password === "password") {
      router.push("/owner");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{
      backgroundColor: "#e9e3d9",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Playfair Display', serif"
    }}>
      <form 
        onSubmit={handleLogin} 
        style={{
          backgroundColor: "#f8f1e7",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}
      >
        <h1 style={{ marginBottom: "2rem" }}>Staff Login</h1>
        <div style={{ marginBottom: "1rem" }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "10px", width: "250px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "2rem" }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: "10px", width: "250px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px", borderRadius: "5px", border: "none", backgroundColor: "#333", color: "white" }}>Login</button>
      </form>
    </div>
  );
}
