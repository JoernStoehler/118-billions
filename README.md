# Obituary SPA

This project is a single-page application (SPA) built with Vite, TypeScript, React, Redux, and Tailwind CSS. It displays static pre-built AI-generated obituaries for fictional humans, showcasing a sombre layout optimized for mobile devices.

## Features

- Display one obituary at a time, including:
  - Name
  - Birth and death years
  - Portrait image
  - Text description
  - World map
- Swipe left and right to navigate through obituaries in a random (deterministic) order.
- Data is sourced from static JSON files and images stored in the `public/obituaries` directory.

## Project Structure

```
README.md
package.json
tsconfig.json
vite.config.ts
vite-env.d.ts
tailwind.config.js
index.html
.env
.env.sample
.gitignore
public/
    production/
        navigation.json
        obituaries/
            example1.json
            example1.png
            example2.json
            example2.png
    development/
        navigation.json
        obituaries/
    discarded/
        navigation.json
        obituaries/
src/
    App.tsx
    main.tsx
    features/
        store.tsx
        obituary.tsx
        navigation.tsx
        swipe.tsx
        admin.tsx
    styles/
        index.css
backend/
    server.js
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd obituary-spa
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- Swipe left or right to navigate through the obituaries.
- Each obituary is displayed in a mobile-optimized layout.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

## API Endpoints

### POST /move

Moves obituary files from the `public/development/obituaries` directory to either `public/production/obituaries` or `public/discarded/obituaries` based on user preference. Also updates the `navigation.json` files.

#### Request Body
- `uuid` (string): The unique identifier of the obituary.
- `liked` (boolean): Indicates whether the obituary was liked (`true`) or disliked (`false`).

#### Response
- `200 OK`: Content moved successfully.
- `400 Bad Request`: Invalid request body.
- `500 Internal Server Error`: Error occurred while moving content.

### POST /generate

Generates a new obituary and saves it to the `public/development/obituaries` directory. Returns the `uuid` of the generated obituary.

#### Request Body
- `uuid` (string, optional): The unique identifier for the obituary. If not provided, a new UUID will be generated.

#### Response
- `200 OK`: Returns the `uuid` of the generated obituary and a success message.
- `500 Internal Server Error`: Error occurred while generating the obituary.

#### Behavior
After calling this endpoint, the application will automatically navigate to the generated obituary using the returned `uuid`.