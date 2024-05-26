import { DefaultTheme } from "styled-components";

const lightTheme: DefaultTheme = {
  main: {
    background: "#ffffff",
    text: {
      color: "#1b1d25",
      weight: 700,
    },
    subText: {
      color: "#878c92",
      weight: 400,
    },
  },
  otherTheme: {
    background: "#1b1d25",
    text: {
      color: "#ffffff",
      weight: 700,
    },
    subText: {
      color: "#bcc0cf",
      weight: 400,
    },
  },
  card: {
    background: "#F3F4F6",
    hover: "rgba(255, 240, 200, 0.3)",
    text: {
      color: "#1b1d25",
    },
  },
};

const darkTheme: DefaultTheme = {
  main: {
    background: "#1b1d25",
    text: {
      color: "#ffffff",
      weight: 700,
    },
    subText: {
      color: "#bcc0cf",
      weight: 400,
    },
  },
  otherTheme: {
    background: "#ffffff",
    text: {
      color: "#1b1d25",
      weight: 700,
    },
    subText: {
      color: "#878c92",
      weight: 400,
    },
  },
  card: {
    background: "#424755",
    hover: "rgba(200, 200, 255, 0.3)",
    text: {
      color: "#FFFFFF",
    },
  },
};

export { lightTheme, darkTheme };
