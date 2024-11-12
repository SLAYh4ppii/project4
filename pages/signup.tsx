import React, { useState } from "react";
import Router from "next/router";
import cookie from "js-cookie";

interface SignupForm {
  username: string;
  password: string;
}

const Signup = () => {
  const [signupError, setSignupError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setSignupError(data.message);
        return;
      }

      if (data.token) {
        cookie.set("token", data.token, { expires: 2 });
        Router.push("/");
      }
    } catch (error) {
      setSignupError("An error occurred during signup");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Sign Up</p>
      <label htmlFor="username">
        username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          name="username"
          type="text"
        />
      </label>

      <br />

      <label htmlFor="password">
        password
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          type="password"
        />
      </label>

      <br />

      <input type="submit" value="Submit" />
      {signupError && <p style={{ color: "red" }}>{signupError}</p>}
    </form>
  );
};

export default Signup;