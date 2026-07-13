import type { AppInstance } from "../../types.js";

const llmsText = `# Codia

Codia provides a small HTTP API for rendering source code snippets into PNG images.
Beautiful Code Images for Humans and APIs.
It uses Shiki for syntax highlighting with a selectable bundled theme, then uses Takumi to render
the highlighted code into an image with optional line numbers. Rendered code uses the Google Fonts Fira Code
font family.

## Primary Endpoint

POST /v1/code/render

Render a code string into a highlighted PNG image and return the image as base64.
Before highlighting, code is normalized to LF line endings and each line is wrapped to a maximum
of 84 characters. The lineCount response reflects the rendered line count after wrapping.
The optional borderSize field controls the outer padding/border area around the rendered code
window. It defaults to 12 pixels. Passing 0 outputs only the code window with no outer canvas.
The optional containerWidth field controls the rendered code window width. It defaults to 600
pixels, with a minimum of 400 pixels and maximum of 1920 pixels. The final PNG width is
containerWidth + borderSize * 2.
After formatting, the server estimates a dynamic minContainerWidth from the widest rendered code
line using the Fira Code monospace metrics. The actual containerWidth is raised to at least this
dynamic minimum to avoid clipping code.
The optional theme field selects any bundled Shiki theme. Unknown themes fall back to dracula.
The optional bgColor field controls the outer area behind the code window. It supports #RRGGBB,
linear-gradient(...), and radial-gradient(...). The legacy backgroundColor field is still accepted
for compatibility.
The optional showLineNumbers field controls whether rendered images include line numbers.

### Request

Content-Type: application/json

Fields:

- code: string, required. Source code to render. Maximum length: 50,000 characters.
- language: string, required. Shiki language id, such as typescript, javascript, python, go,
  rust, html, css, json, markdown, bash, or text. Unknown languages fall back to text.
- theme: string, optional. Bundled Shiki theme name. Default: dracula.
- bgColor: string, optional. Outer background style. Supports #RRGGBB, linear-gradient(...),
  and radial-gradient(...). Default: sky cyan radial gradient.
- backgroundColor: string, optional. Legacy alias for bgColor.
- borderSize: number, optional. Outer padding/border size in pixels. Default: 12. Maximum: 120.
- containerWidth: number, optional. Code window width in pixels. Default: 600. Minimum: 400.
  Maximum: 1920. The actual value may be raised to minContainerWidth.
- showLineNumbers: boolean, optional. Whether to show line numbers. Default: true.

Example request:

\`\`\`json
{
  "language": "typescript",
  "theme": "dracula",
  "bgColor": "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
  "borderSize": 12,
  "containerWidth": 600,
  "showLineNumbers": true,
  "code": "const message: string = \\"Hello, Takumi\\";\\nconsole.log(message);"
}
\`\`\`

### Response

Content-Type: application/json

Fields:

- imageBase64: string. PNG base64 payload without a data URL prefix.
- dataUrl: string. PNG data URL that can be assigned directly to an img src.
- mimeType: "image/png".
- language: string. Actual language used by Shiki. Unknown languages return text.
- theme: string. Actual Shiki theme used for rendering.
- bgColor: string. Actual outer background style used for rendering.
- backgroundColor: string. Legacy response field with the same value as bgColor.
- lineCount: number. Number of rendered code lines.
- showLineNumbers: boolean. Whether line numbers were shown.
- borderSize: number. Outer padding/border size used for the render.
- minContainerWidth: number. Dynamic minimum code window width estimated from the widest
  formatted code line.
- containerWidth: number. Actual code window width used for the render.
- width: number. Final image width in pixels. Equal to containerWidth + borderSize * 2.
- height: number. Image height in pixels.

Example response shape:

\`\`\`json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "mimeType": "image/png",
  "language": "typescript",
  "theme": "dracula",
  "bgColor": "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
  "backgroundColor": "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
  "lineCount": 2,
  "showLineNumbers": true,
  "borderSize": 12,
  "minContainerWidth": 400,
  "containerWidth": 600,
  "width": 624,
  "height": 164
}
\`\`\`

## Human Preview

GET /example

Returns an HTML page where users can choose a language, enter code, live-preview highlighted
editing, switch to the final rendered image tab, and copy or download the generated PNG.

## OpenAPI

GET /openapi.json
GET /docs

OpenAPI JSON and Swagger UI are available for the JSON API.
`;

export const route_GET_llms_txt = (app: AppInstance) => {
  app.get("/llms.txt", (c) =>
    c.text(llmsText, 200, {
      "content-type": "text/plain; charset=utf-8",
    }),
  );
};
