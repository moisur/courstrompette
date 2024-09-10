/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"

export default function MilesDavis() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Miles Davis: Le Géant du Jazz 🎺</h1>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Image
            src="/miles-davis.jpg"
            alt="Miles Davis, un des plus grands trompettistes de jazz"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <p className="mb-6">
        Miles Davis, né en 1926, est un trompettiste et compositeur américain
        considéré comme l'un des plus grands musiciens de jazz de tous les
        temps. Il a révolutionné la musique jazz à plusieurs reprises,
        explorant de nouveaux styles et influençant des générations de
        musiciens.
      </p>

      <h2 className="text-2xl font-bold mb-4">Des débuts classiques au bebop</h2>

      <p className="mb-6">
        Davis commence à jouer de la trompette à l'âge de 13 ans et étudie
        la musique classique. Il est rapidement repéré pour son talent et
        intègre le groupe de jazz de Charlie Parker, un pionnier du bebop,
        en 1945. Il se forge une réputation de virtuose du bebop,
        développant un style unique et influencé par Parker.
      </p>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Image
            src="/miles-davis-bebop.jpg"
            alt="Miles Davis jouant du bebop"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Le cool jazz et l'innovation</h2>

      <p className="mb-6">
        À la fin des années 1940, Davis s'éloigne du bebop et se tourne
        vers le "cool jazz", un style plus mélodique et introspectif. Il
        forme son propre groupe, "The Birth of the Cool", qui révolutionne
        le jazz avec des arrangements raffinés et un son plus doux. Davis
        continue à innover, explorant des styles comme le modal jazz et
        le jazz fusion dans les années 1960 et 1970.
      </p>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Image
            src="/miles-davis-cool-jazz.jpg"
            alt="Miles Davis jouant du cool jazz"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Une influence indéniable</h2>

      <p className="mb-6">
        L'influence de Miles Davis sur la musique moderne est
        indéniable. Il a inspiré des générations de musiciens, de
        trompettistes en particulier. Son style unique, sa recherche
        constante d'innovation et son audace artistique ont contribué
        à l'évolution du jazz et ont influencé la musique rock, le funk,
        la soul et la musique électronique.
      </p>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Image
            src="/miles-davis-influence.jpg"
            alt="L'influence de Miles Davis sur la musique moderne"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Un héritage durable</h2>

      <p className="mb-6">
        Miles Davis est décédé en 1991, mais son héritage musical
        continue à inspirer et à fasciner les musiciens et les
        mélomanes du monde entier. Ses albums, comme "Kind of Blue",
        "Bitches Brew" et "Sketches of Spain", sont considérés comme
        des chefs-d'œuvre du jazz et restent des références
        incontournables.
      </p>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Image
            src="/miles-davis-albums.jpg"
            alt="Albums emblématiques de Miles Davis"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <p className="mb-4">
        Pour tout trompettiste, l'histoire de Miles Davis est une source
        d'inspiration et d'apprentissage. Son audace, sa créativité et
        son talent ont laissé une empreinte indélébile sur la musique.
      </p>

      <p>
        <strong>N'hésitez pas à explorer ses albums et à écouter ses
        musiques. Vous découvrirez un univers musical riche et
        fascinant!</strong>
      </p>
    </article>
  );
}