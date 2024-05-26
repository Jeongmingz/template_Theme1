import styled from "styled-components";

interface TitleProp {
  title: string;
}

const BannerTitle: React.FC<TitleProp> = ({ title }) => {
  return (
    <Container>
      <span>
        {title}
      </span>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  box-sizing: border-box;
  & > span {
    font-size: 28px;
    font-weight: 800;
  }
`

export default BannerTitle;