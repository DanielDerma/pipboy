# Pip-Boy Task Manager

Greetings, Vault Dweller! Welcome to your very own Pip-Boy Task Management Unit. This application is designed to help you keep track of your daily tasks, habits, and to-dos, all while surviving and thriving in the wasteland (or, you know, your everyday life). Stay organized, level up your skills, and earn rewards, all with a retro-futuristic Pip-Boy interface.

## Screenshots

[Add Screenshot of Main Dashboard/Tasks Tab Here]
[Add Screenshot of Character Stats Tab Here]
[Add Screenshot of Rewards Tab Here]

## Features

*   **Task Management:**
    *   **Habits:** Track and build positive (or delightfully nefarious) habits.
    *   **Dailies:** Manage tasks that reset every day. Never miss a Nuka-Cola run!
    *   **To-Dos:** Keep a list of one-off tasks to conquer.
*   **Character Progression:**
    *   **XP & Levels:** Gain experience points (XP) for completing tasks and level up your S.P.E.C.I.A.L. stats (or custom skills).
    *   **Caps:** Earn Bottle Caps (or your preferred currency) as rewards for your diligence.
*   **Rewards System:** Spend your hard-earned Caps on custom rewards.
*   **Pip-Boy Themed Interface:** Immerse yourself in a retro-futuristic UI, complete with familiar Pip-Boy aesthetics.
*   **Progressive Web App (PWA) & Offline Support:** Access your tasks even when the G.O.A.T. test administrator isn't around (i.e., offline). Your data is stored locally!
*   **Data Sync (Sync Queue):** Includes a sync queue mechanism for potential future backend integration, ensuring your data isn't lost to the void.

## Technology Stack

This Pip-Boy unit is constructed with the finest pre-war (and some post-war) technology:

*   **Next.js:** For a fast and modern React framework.
*   **React:** For building the interactive user interface.
*   **TypeScript:** For robust and type-safe code.
*   **Tailwind CSS:** For utility-first styling, keeping things looking sharp.
*   **IndexedDB:** For client-side storage, ensuring your data is safe even in a nuclear winter.
*   **Radix UI:** For accessible and unstyled UI primitives.
*   **Lucide Icons:** For a vast array of clean and crisp icons.

## Getting Started

Ready to get your life organized, Vault-Tec style?

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  **Install Dependencies:**
    This project uses `pnpm` for package management.
    ```bash
    pnpm install
    ```
3.  **Run the Development Server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the Pip-Boy in action.

## Project Structure

A quick look inside the chassis:

*   `app/`: Core application routing, pages, and layouts. This is where the main structure of your Pip-Boy interface resides.
*   `components/`: Reusable UI components. Includes essential parts like the `PipBoyLayout` and the various data tabs (Status, Tasks, Data, etc.).
*   `lib/`: Utility functions and core services.
    *   `db-service.ts`: Manages all interactions with the client-side IndexedDB.
    *   `sync-service.ts`: Handles the data synchronization queue for future backend integration.
*   `public/`: Static assets, including images, fonts, and PWA configuration files like `sw.js` (Service Worker) and `manifest.ts`.

## How It Works

This Pip-Boy operates primarily on your local terminal (i.e., your browser).

*   **Frontend:** Built with Next.js and React, providing a dynamic and interactive experience.
*   **Client-Side Storage:** Leverages IndexedDB to store all your tasks, habits, character stats, and rewards directly in your browser. This means you can use it offline!
*   **PWA Capabilities:** Designed as a Progressive Web App, allowing you to "install" it on your device for a more native-app feel and offline access.
*   **Sync Queue:** While currently operating client-side, a sync queue is implemented (`lib/sync-service.ts`). This system logs data changes (creations, updates, deletions) and is designed to push these changes to a backend server when one is integrated, allowing for data persistence across devices and sessions.

## Deployment

This Pip-Boy unit can be deployed to various platforms that support Next.js applications, such as Vercel. It's also a PWA, meaning it can be "installed" on supported devices for an app-like experience.

You can check out a live deployment here: [Vercel Deployment](https://vercel.com/daniel-dermas-projects/v0-pip-boy-application-design)

## Contributing

Found a bug or have an idea for a new feature? Contributions are welcome! Please open an issue to discuss your ideas or submit a pull request with your enhancements. Let's make this the best task manager in the wasteland!

## License

This project is licensed under the MIT License.

---

*Stay organized. Stay vigilant. And don't feed the Yao Guai.*