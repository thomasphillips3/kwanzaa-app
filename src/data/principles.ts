export interface Principle {
    id: number;
    name: string;
    description: string;
    reflectionPrompt: string;
}

export const principles: Principle[] = [
    {
        id: 1,
        name: "Umoja (Unity)",
        description: "To strive for and maintain unity in the family, community, nation, and race.",
        reflectionPrompt: "How can you foster unity in your community today?"
    },
    {
        id: 2,
        name: "Kujichagulia (Self-Determination)",
        description: "To define ourselves, name ourselves, create for ourselves, and speak for ourselves.",
        reflectionPrompt: "In what ways can you express your self-determination?"
    },
    {
        id: 3,
        name: "Ujima (Collective Work and Responsibility)",
        description: "To build and maintain our community together and make our brothers’ and sisters’ problems our problems.",
        reflectionPrompt: "How can you contribute to collective work in your community?"
    },
    {
        id: 4,
        name: "Ujamaa (Cooperative Economics)",
        description: "To build and maintain our own stores, shops, and other businesses and to profit from them together.",
        reflectionPrompt: "What cooperative economic activities can you support?"
    },
    {
        id: 5,
        name: "Nia (Purpose)",
        description: "To make our collective vocation the building and developing of our community.",
        reflectionPrompt: "What is your purpose in building your community?"
    },
    {
        id: 6,
        name: "Kuumba (Creativity)",
        description: "To always do as much as we can, in the way we can, to leave our community more beautiful and beneficial.",
        reflectionPrompt: "How can you use creativity to improve your community?"
    },
    {
        id: 7,
        name: "Imani (Faith)",
        description: "To believe with all our heart in our people, our parents, our teachers, our leaders, and the righteousness of our struggle.",
        reflectionPrompt: "What gives you faith in your community and its future?"
    }
];