import styled from "styled-components";
import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";

interface MainLayoutProps {
	children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<Container>
			<MainHeader />
			{children}
			<MainFooter />
		</Container>
	)
}

const Container = styled.div`

`

export default MainLayout;