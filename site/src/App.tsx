import { Ambient, Footer, Nav } from './components/Chrome'
import { Hero } from './components/Hero'
import { Competency, Curriculum, Finale, Majors, Mission, NewsPreview, Programs } from './components/Sections'

export default function App() {
  return (
    <>
      <Ambient />
      <Nav />
      <main id="main-content">
        <Hero />
        <Mission />
        <Competency />
        <Majors />
        <Curriculum />
        <Programs />
        <NewsPreview />
        <Finale />
      </main>
      <Footer />
    </>
  )
}
