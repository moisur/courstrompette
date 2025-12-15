import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductWidgetProps {
    title: string
    description: string
    imageUrl: string
    price: string
    affiliateLink: string
}

export function AmazonWidget({ title, description, imageUrl, price, affiliateLink }: ProductWidgetProps) {
    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="aspect-square relative">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-md"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-between">
                <p className="text-2xl font-bold">{price}</p>
                <Button asChild>
                    <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                        Acheter sur Amazon
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}