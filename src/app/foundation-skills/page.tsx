
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { foundationSkills } from '@/lib/course-data';

export default function FoundationSkillsPage() {
    const skills = Object.values(foundationSkills);

  return (
    <div className="container mx-auto py-6 sm:py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Foundation Skills</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Strong fundamentals are the key to a high IELTS score. Use these tools to build your core English abilities.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {skills.map(skill => {
            const { icon: Icon } = skill;
            return (
              <Link href={skill.href} key={skill.title}>
                <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center items-center">
                    <div className="p-4 bg-primary/10 rounded-lg mb-3">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{skill.title}</CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  );
}
