import type { AppInstance } from "../../types.js";

const llmsText = `# Codia

Codia provides a small HTTP API for rendering source code snippets into WebP, PNG, or JPEG images.
Beautiful Code Images for Humans and APIs.
It uses Shiki for syntax highlighting with a selectable bundled theme, then uses Takumi to render
the highlighted code into an image with optional line numbers. Rendered code uses the Google Fonts Fira Code
font family.

## Primary Endpoint

POST /v1/code/render

Render a code string into a highlighted image and return the image as base64.
Before highlighting, code is normalized to LF line endings and each line is wrapped to a maximum
of 84 characters. The lineCount response reflects the rendered line count after wrapping.
The optional borderSize field controls the outer padding/border area around the rendered code
window. It defaults to 12 pixels. Passing 0 outputs only the code window with no outer canvas.
The optional borderRadius field controls the code window corner radius. It defaults to 4 pixels.
When borderSize is greater than 0, borderRadius is normalized to be greater than or equal to 0
and smaller than borderSize. When borderSize is 0, borderRadius is forced to 0.
The outer canvas is transparent. When borderSize is greater than 0, the background container
behind the code window receives an outer radius of borderRadius + borderSize, clamped to the
image bounds, so the inner and outer rounded corners stay visually concentric.
The optional containerWidth field controls the rendered code window width. It defaults to 600
pixels, with a minimum of 400 pixels and maximum of 1920 pixels. The final image width is
containerWidth + borderSize * 2.
After formatting, the server estimates a dynamic minContainerWidth from the widest rendered code
line using the Fira Code monospace metrics. The actual containerWidth is raised to at least this
dynamic minimum to avoid clipping code.
The optional theme field selects any bundled Shiki theme. Unknown themes fall back to dracula.
The optional bgColor field controls the outer area behind the code window. It supports #RRGGBB,
linear-gradient(...), and radial-gradient(...). The legacy backgroundColor field is still accepted
for compatibility.
The optional showLineNumbers field controls whether rendered images include line numbers.
The optional quality field controls output pixel density. It defaults to 1. Use 2 for high
quality and 3 for ultra quality. Layout dimensions stay the same, but output pixel width and
height are multiplied by quality.
Every successful render is recorded in SQLite as a lightweight generation event. Codia does
not store the submitted code, generated image base64 payload, data URL, or image file content.
Stored metadata includes language, theme, dimensions, line count, source, and timestamp.

### Request

Content-Type: application/json

Fields:

- code: string, required. Source code to render. Maximum length: 50,000 characters.
- language: string, required. Shiki language id, such as typescript, javascript, python, go,
  rust, html, css, json, markdown, bash, or text. Unknown languages fall back to text.
- format: string, optional. Output format. Default: webp. Supports webp, png, jpg, and jpeg.
- theme: string, optional. Bundled Shiki theme name. Default: dracula.
- bgColor: string, optional. Outer background style. Supports #RRGGBB, linear-gradient(...),
  and radial-gradient(...). Default: sky cyan radial gradient.
- backgroundColor: string, optional. Legacy alias for bgColor.
- borderSize: number, optional. Outer padding/border size in pixels. Default: 12. Maximum: 120.
- borderRadius: number, optional. Code window corner radius in pixels. Default: 4. When
  borderSize is greater than 0, the actual value is normalized to be greater than or equal to
  0 and smaller than borderSize. When borderSize is 0, the actual value is 0.
- containerWidth: number, optional. Code window width in pixels. Default: 600. Minimum: 400.
  Maximum: 1920. The actual value may be raised to minContainerWidth.
- showLineNumbers: boolean, optional. Whether to show line numbers. Default: true.
- quality: number, optional. Output pixel density multiplier. Default: 1. Minimum: 1.
  Maximum: 3. Use 2 for high-quality browser previews.
- source: string, optional. One of api, try-it-preview, try-it-copy, try-it-download.
  Default: api. Every successful call increments render statistics once.

Example request:

\`\`\`json
{
  "language": "typescript",
  "format": "webp",
  "theme": "dracula",
  "bgColor": "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
  "borderSize": 12,
  "borderRadius": 4,
  "containerWidth": 600,
  "showLineNumbers": true,
  "quality": 2,
  "code": "const message: string = \\"Hello, Takumi\\";\\nconsole.log(message);"
}
\`\`\`

### Response

Content-Type: application/json

Fields:

- imageBase64: string. Image base64 payload without a data URL prefix.
- dataUrl: string. Image data URL that can be assigned directly to an img src.
- mimeType: "image/webp", "image/png", or "image/jpeg".
- format: "webp", "png", or "jpeg".
- language: string. Actual language used by Shiki. Unknown languages return text.
- theme: string. Actual Shiki theme used for rendering.
- bgColor: string. Actual outer background style used for rendering.
- backgroundColor: string. Legacy response field with the same value as bgColor.
- lineCount: number. Number of rendered code lines.
- showLineNumbers: boolean. Whether line numbers were shown.
- borderSize: number. Outer padding/border size used for the render.
- borderRadius: number. Code window corner radius used for the render.
- minContainerWidth: number. Dynamic minimum code window width estimated from the widest
  formatted code line.
- containerWidth: number. Actual code window width used for the render.
- logicalWidth: number. Logical image width in CSS pixels, equal to containerWidth + borderSize * 2.
- logicalHeight: number. Logical image height in CSS pixels.
- width: number. Actual output image width in pixels, equal to logicalWidth * quality.
- height: number. Actual output image height in pixels, equal to logicalHeight * quality.
- quality: number. Output pixel density multiplier used for the render.
- recordId: number. SQLite render record id for this generated image.

Example response shape:

\`\`\`json
{
  "imageBase64": "UklGRjIAAABXRUJQ...",
  "dataUrl": "data:image/webp;base64,UklGRjIAAABXRUJQ...",
  "mimeType": "image/webp",
  "format": "webp",
  "language": "typescript",
  "theme": "dracula",
  "bgColor": "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
  "backgroundColor": "radial-gradient(circle at top center, rgba(106, 196, 226, 0.9) 0%, rgba(38, 143, 184, 0.85) 28%, rgba(9, 88, 132, 0.95) 60%, #062e55 100%)",
  "lineCount": 2,
  "showLineNumbers": true,
  "borderSize": 12,
  "borderRadius": 4,
  "minContainerWidth": 400,
  "containerWidth": 600,
  "logicalWidth": 624,
  "logicalHeight": 164,
  "width": 1248,
  "height": 328,
  "quality": 2,
  "recordId": 42
}
\`\`\`

## Stats Endpoint

GET /v1/code/stats

Returns aggregate SQLite render and satisfaction stats for the homepage and external tools, including
total renders, generated image count, satisfaction count, total rendered lines, top languages, and
recent generation records. Stats do not include stored code or image content.

## Satisfaction Endpoint

POST /v1/feedback/satisfaction

Record one successful /try-it copy or download action. Each successful action adds one satisfaction
event. The server stores only the action type and timestamp, not the code or image content.

Request body:

\`\`\`json
{
  "action": "copy"
}
\`\`\`

The action must be \`copy\` or \`download\`. The response includes \`accepted: true\` and the current
\`totalSatisfactions\` count.

## Human Preview

GET /try-it

Returns an HTML page where users can choose a language, enter code, switch between editor and
final rendered image tabs, and copy or download the generated image. The legacy /example route
redirects to /try-it.

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
