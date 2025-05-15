# AR/VR Card Interface - A-Frame Web Project

An immersive, interactive VR/AR card interface built with A-Frame, CSS, and vanilla JavaScript. This project demonstrates how to create floating, interactive card interfaces in 3D space that can be used in AR and VR applications.

## Features

- Fully immersive A-Frame scene with 3D card interface
- Interactive cards with hover and click animations
- Speech bubble and avatar elements
- Realistic translucent card materials with proper lighting
- External HTML controls for card manipulation
- Keyboard navigation support
- Mobile and desktop VR compatibility
- A-Frame scene embedded in a responsive webpage

## Technologies Used

- A-Frame 1.4.0 for WebVR/WebAR rendering
- Vanilla JavaScript for interactions
- CSS for styling A-Frame elements and controls
- Environment component for immersive backgrounds
- Event-set component for interactive elements

## File Structure

```
.
├── index.html          # Main HTML file with A-Frame scene
├── styles/
│   └── main.css        # CSS styles for A-Frame and website
├── scripts/
│   └── main.js         # JavaScript interactions
└── README.md           # Project documentation
```

## Card Interface Components

The interface consists of three main card types:

1. **Main Card (Left)** - Primary content card with product image and description
2. **Side Card (Top Right)** - Secondary information card
3. **Assistant Card (Bottom Right)** - Conversational interface with avatar and speech bubble

Each card has:
- Hover animations with scale and brightness changes
- Click interactions with position/rotation animations
- Translucent material with proper 3D lighting
- Text content with proper MSDF shader rendering

## Interaction Methods

The card interface can be interacted with using multiple methods:

- **VR Controllers/Gaze** - Look at cards and click to interact
- **Mouse** - Hover and click on cards in desktop mode
- **External Controls** - HTML buttons outside the A-Frame scene
- **Keyboard Shortcuts** - Numbers 1-3 to activate cards, arrow keys for navigation

## How to Use

1. Clone or download this repository
2. Open `index.html` in your web browser to view the interface
3. For VR mode, click the VR headset icon in the bottom right
4. Interact with cards by looking at them and clicking
5. Use the external controls at the bottom of the page

## Customization

### Card Content

Edit the card content in `index.html` by modifying the A-Frame entities:

```html
<a-entity position="-0.35 -0.3 0.002"
         text="shader: msdf; anchor: left; width: 1.5; 
         font: https://cdn.aframe.io/examples/ui/Viga-Regular.json; 
         color: white; value: Your Custom Text; wrapCount: 20;"></a-entity>
```

### Card Styling

Customize the card appearance by editing the CSS variables in `styles/main.css`:

```css
:root {
  --card-opacity: 0.85;
  --card-color: #4a4a4a;
  --card-highlight: #5a5a5a;
  --text-color: white;
}
```

### Adding More Cards

To add new cards, copy an existing card entity and modify its position, content, and animations:

```html
<a-entity id="new-card" position="x y z" rotation="0 0 0" scale="1 1 1" class="clickable">
  <!-- Card content here -->
</a-entity>
```

## Browser Support

This template is compatible with:
- Chrome (latest) with WebVR/WebXR support
- Firefox (latest) with WebVR/WebXR support
- Oculus Browser
- Mobile AR browsers (with WebXR support)

## License

This project is open source and available under the [MIT License](LICENSE). 