
export interface DemoItem {
  title: string;
  description: string;
  route: string;
  icon?: string;
}

export const modalDemos: DemoItem[] = [
  {
    title: "Fun Claw Game",
    description: "Play the claw machine game! Catch items as the claw moves across the screen.",
    route: "/game",
    icon: "🎮",
  },
  {
    title: "Modal",
    description: "A simple modal that slides up from the bottom",
    route: "/modal",
    icon: "📱",
  },
  {
    title: "Transparent Modal",
    description: "A modal with a transparent background",
    route: "/transparent-modal",
    icon: "🪟",
  },
  {
    title: "Form Sheet",
    description: "A form sheet modal (iOS style)",
    route: "/formsheet",
    icon: "📋",
  },
];
