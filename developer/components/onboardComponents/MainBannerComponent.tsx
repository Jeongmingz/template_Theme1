import { MousePosition } from "@/public/types";
import React, { useState, MouseEvent } from "react";
import styled from "styled-components";

interface MainBannerProp {
  title: string | undefined;
  mainContent: string | undefined;
  subContent: string | undefined;
  width: number;
}


const MainBannerComponent: React.FC<MainBannerProp> = ({
  title,
  mainContent,
  subContent,
  width
}) => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    setMousePos({
      x: clientX - left,
      y: clientY - top,
    });
  };

  return (
    <Container
      onMouseMove={handleMouseMove}
      mousePos={mousePos}
      width={width}
    >
      <Title>{title}</Title>
      <Content>
        <MainContent>
          <span>
            {mainContent}
          </span>
        </MainContent>
        {subContent &&
          <SubContent>{subContent}</SubContent>
        }
      </Content>
    </Container>
  );
};

const Container = styled.div<{ mousePos: MousePosition; width: number; }>`
  flex: ${({ width }) => width === 100 ? `
  1 1 100%
  ` : `
  1 1 ${width}%
  `} ; 

  min-height: 200px;

  box-sizing: border-box;

  position: relative;
  display: flex;

  flex-direction: column;
  justify-content: flex-start;
  padding: 4rem 2vw;

  border-radius: 12px;
  background-color: ${({ theme }) => theme.card.background};
  color: ${({ theme }) => theme.card.text.color};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  word-break: keep-all;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: radial-gradient(
      circle at ${({ mousePos }) => `${mousePos.x}px ${mousePos.y}px`},
      ${({ theme }) => theme.card.hover},
      transparent
    );
    pointer-events: none;
    transition: opacity 0.1s ease;
    opacity: 0;
    will-change: opacity;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 40px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  & > span{
    font-weight: 500;
    font-size: 20px;
  }
`;

const SubContent = styled.div`
  margin-top: 20px;
  font-weight: 400;
  font-size: 18px;
`;

export default MainBannerComponent;
