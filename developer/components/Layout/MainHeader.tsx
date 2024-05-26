import styled from "styled-components";


const MainHeader: React.FC = () => {

  return (
    <HeaderContainer>
      <Logo href="/">API Repo</Logo>
      <Nav>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </Nav>
    </HeaderContainer>)
}

const HeaderContainer = styled.header`
width: calc(100vw - 4rem);
padding: 1rem 2rem;

display: flex;
justify-content: space-between;
align-items: center;

background-color: ${({ theme }) => theme.otherTheme.background};

position: fixed;
z-index: 100;
`;

const Logo = styled.a`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.otherTheme.text.weight};
  margin: 0;
  color:  ${({ theme }) => theme.otherTheme.text.color};
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled.a`
  text-decoration: none;
  color:  ${({ theme }) => theme.otherTheme.subText.color};
  ${({ theme }) => theme.otherTheme.subText.weight}
  
  &:hover {
    color:  ${({ theme }) => theme.otherTheme.text.color};
  }
`;


export default MainHeader;