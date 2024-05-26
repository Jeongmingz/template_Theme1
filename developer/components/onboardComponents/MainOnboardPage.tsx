import styled from "styled-components";
import MainBannerComponent from "./MainBannerComponent";
import MainSignupLabel from "./MainSignupLabel";
import BannerTitle from "./BannerTitle";
import Image from "next/image";

const MainOnboardPage: React.FC = () => {
  return (
    <Container>
      <Image src="/icons/icon-folder-cloud-dark.svg" alt="" width={350} height={350} />
      <MainBannerComponent
        title="무료로 API 명세서를 작성해보세요"
        mainContent="작성, 수정, 테스트, 배포까지"
        subContent=""
        width={50}
      />
      <MainSignupLabel />

      <BannerTitle
        title='기존의 API 명세서,'
      />

      <MainBannerComponent
        title="정형화되지 않았던 API 명세서"
        mainContent="request, response, status code, body, header.."
        subContent=""
        width={30}
      />
      <MainBannerComponent
        title="제작자마다 다른 양식의 API 명세서"
        mainContent="Excel, Notion, Postman, 개인 웹사이트"
        subContent=""
        width={30}
      />
      <MainBannerComponent
        title="테스트 해볼 수 없는 API 명세서"
        mainContent="Excel, Notion의 경우 테스트 X"
        subContent=""
        width={30}
      />
    </Container>
  )
}

const Container = styled.div`
  width: 100vw;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  align-items: stretch;
  justify-content: center;


  gap: 30px;
  
  padding: 0 5vw;
  padding-top: 100px;

  flex: 1 1 calc(50% - 10px); /* 2개씩 한 줄에 배치 */
  box-sizing: border-box; /* padding과 border를 width에 포함 */
`



export default MainOnboardPage;