import { DefaultTheme } from "styled-components";

const lightTheme: DefaultTheme = {
  colors: {
    background: "#ffffff",
    text: "#1b1d25",
    subText: "#878c92",
  },
  otherThemeColors:  {
    background: "#1b1d25",
    text: "#ffffff",
    subText: "#bcc0cf",
  },
};

const darkTheme: DefaultTheme = {
  colors: {
    background: "#1b1d25",
    text: "#ffffff",
    subText: "#bcc0cf",
  },
  otherThemeColors:  {
    background: "#ffffff",
    text: "#1b1d25",
    subText: "#878c92",
  },
};

export { lightTheme, darkTheme };
