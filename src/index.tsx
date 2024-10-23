// React 관련 import 문을 아래에 위치시킵니다.
import * as React from "react"; // import 문
import { createRoot } from "react-dom/client"; // import 문

import App from "./App"; // import 문
import "./index.css"; // import 문

const container = document.getElementById("root") as HTMLElement; // DOM 요소 가져오기
const root = createRoot(container); // React DOM root 생성

root.render(<App />); // React 애플리케이션 렌더링
