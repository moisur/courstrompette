import TrumpetTrainer from '../../components/musique/TrumpetTrainer'

export default function Home() {
  return (
    <main className="flex min-h-screen  flex-col items-center justify-between p-4  bg-gradient-to-b from-blue-100 to-blue-200 px-4 py-20">
      <h1 className="text-4xl font-bold mb-8 text-blue-800">Trumpet Trainer</h1>
      <TrumpetTrainer />
    </main>
  )
}

