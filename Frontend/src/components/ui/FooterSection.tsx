import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Footer,
  FooterColumn,
  FooterBottom,
  FooterContent,
} from "@/components/ui/footer";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import InnlandetLogo from "@/components/icons/logo.png";

export default function FooterSection() {
  return (
    <footer className="w-full bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Footer>
          <FooterContent className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
            {/* Logo and Contact Column */}
            <FooterColumn className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={InnlandetLogo} 
                  alt="Logo" 
                  className="h-12 w-10 object-contain"
                />
                <h3 className="text-2xl font-bold tracking-tight">IKT Elvis</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Telefon: <span className="font-medium">910 08 724</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  E-post:{" "}
                  <a 
                    href="mailto:support.EL@innlandetfylke.no"
                    className="hover:text-primary transition-colors"
                  >
                    support.EL@innlandetfylke.no
                  </a>
                </p>
                {/* <Button variant="outline" className="mt-4">
                  Kontakt Oss
                </Button> */}
              </div>
            </FooterColumn>

            {/* Links Columns */}
            <FooterColumn className="space-y-3">
              <h3 className="text-lg font-semibold">Tjenester</h3>
              <div className="space-y-2">
                {['Systemer', 'Verkøy', 'Dokumentasjon'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary block transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </FooterColumn>

            <FooterColumn className="space-y-3">
              <h3 className="text-lg font-semibold">Informasjon</h3>
              <div className="space-y-2">
                {['Om Oss', 'Ansatte', 'Vilkår', 'Personvern'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary block transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </FooterColumn>

            <FooterColumn className="space-y-3">
              <h3 className="text-lg font-semibold">Ressurser</h3>
              <div className="space-y-2">
                {['Dokumenter', 'Veiledninger', 'Skjemaer', 'FAQ'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary block transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </FooterColumn>
          </FooterContent>

          <Separator className="my-6" />

          <FooterBottom className="flex flex-col md:flex-row justify-between items-center py-6 gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Kasper Kilde. Alle rettigheter reservert
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button variant="ghost" size="sm">
                Personvern
              </Button>
              <Button variant="ghost" size="sm">
                Vilkår
              </Button>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}