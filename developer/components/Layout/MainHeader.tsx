import styled from "styled-components";

const MainHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <Logo href="/">ApiHub</Logo>
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

  background-color: #333;
  color: #fff;

  position: fixed;

`;

const Logo = styled.a`
    font-size: 1.5rem;
    margin: 0;
    color: #fff;
    text-decoration: none;
`;

const Nav = styled.nav`
    display: flex;
    gap: 1rem;
`;

const NavLink = styled.a`
    color: #fff;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

export default MainHeader;