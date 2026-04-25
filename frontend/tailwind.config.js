export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:'#0d0d14', bg2:'#13131f', bg3:'#1a1a2a',
        card:'rgba(255,255,255,0.04)', bdr:'rgba(255,255,255,0.07)',
        purple:'#6c5ce7', purple2:'#a29bfe',
        blue:'#0984e3', green:'#00b894',
        red:'#d63031', amber:'#fdcb6e',
        txt:'#f0f0fa', txt2:'rgba(255,255,255,0.45)', txt3:'rgba(255,255,255,0.2)',
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      animation: { 'fade-up':'fadeUp .4s ease both', 'slide-in':'slideIn .3s ease both' },
      keyframes: {
        fadeUp:{from:{opacity:'0',transform:'translateY(10px)'},to:{opacity:'1',transform:'translateY(0)'}},
        slideIn:{from:{opacity:'0',transform:'translateX(-6px)'},to:{opacity:'1',transform:'translateX(0)'}},
      }
    }
  },
  plugins: []
}
