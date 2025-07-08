import FluencyClient from './fluency-client';
import { foundationSkills } from '@/lib/course-data';

export default function FluencyPage() {
    const { icon: Icon, title, description, fluencyExercises } = foundationSkills.fluency;

    return (
        <div className="container mx-auto py-6 sm:py-10 max-w-3xl">
            <header className="mb-8 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">{title}</h1>
                    <p className="text-muted-foreground mt-2">{description}</p>
                </div>
            </header>
            <main>
                <FluencyClient exercises={fluencyExercises} />
            </main>
        </div>
    );
}
