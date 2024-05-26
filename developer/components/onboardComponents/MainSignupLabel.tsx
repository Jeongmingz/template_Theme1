import React, { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { emailCheck } from "@/public/functions";



const MainSignupLabel: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [emailStat, setEmailStat] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup = () => {
    if (email && emailStat) {
      router.push({
        pathname: "/signup",
        query: { email },
      });
    } else {
      if (!email) {
        alert("Please enter a valid email address");
      }
      else if (!emailStat) {
        alert("You have entered an invalid email address!")
      }
    }
  };

  const regexEmail = (inputEmail: string) => {
    setEmail(inputEmail);
    setEmailStat(emailCheck(email));
  }

  return (
    <Container>
      <SignupContent>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => regexEmail(e.target.value)}
        />
        <SignupButton onClick={handleSignup}>Sign up for API Repo</SignupButton>
      </SignupContent>

    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px 0;
  box-sizing: border-box;
  gap: 20px;
`;




const SignupContent = styled.div`
  display: flex;
  flex-direction: row;
  padding-right: 20px;

  border-right: 2px solid ${({ theme }) => theme.card.background};
`

const Input = styled.input`
  text-indent: 14px;
  border: 1px solid #ccc;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;

  width: 300px;
  height: 50px;
  box-sizing: border-box;

  font-size: 18px;
`;

const SignupButton = styled.button`
  border: none;
  padding: 0px 30px;
  height: 50px;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;

  background-color: #0070f3;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;

  font-size: 18px;
  font-weight: 700;

  &:hover {
    background-color: #005bb5;
  }
`;

export default MainSignupLabel;
