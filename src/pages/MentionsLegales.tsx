import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const MentionsLegales = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border py-4">
      <div className="container max-w-4xl mx-auto px-4 flex items-center gap-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img src={logo} alt="KoobNaaba" className="h-8 w-auto" />
      </div>
    </header>
    <main className="container max-w-4xl mx-auto px-4 py-12 prose prose-headings:text-foreground prose-p:text-muted-foreground max-w-none">
      <h1 className="text-3xl font-heading font-bold text-foreground">Mentions Légales</h1>
      <p className="text-sm text-muted-foreground">Dernière mise à jour : 8 mars 2026</p>

      <h2 className="text-xl font-semibold text-foreground mt-8">1. Éditeur du site</h2>
      <p>
        <strong>KoobNaaba</strong><br />
        Société à Responsabilité Limitée (SARL)<br />
        Capital social : 1 000 000 FCFA<br />
        Siège social : Quartier Cissin, Rue 15.42, Porte 258<br />
        Ouagadougou, Burkina Faso<br />
        RCCM : BF-OUA-01-2026-XXXXX<br />
        IFU : XXXXXXXXXX<br />
        Email : <a href="mailto:contact@koobnaaba.com" className="text-primary">contact@koobnaaba.com</a><br />
        Téléphone : +226 XX XX XX XX
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8">2. Directeur de la publication</h2>
      <p>Le Directeur de la publication est le Gérant de la société KoobNaaba.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8">3. Hébergement</h2>
      <p>
        Le site est hébergé par :<br />
        <strong>Lovable Cloud</strong><br />
        Infrastructure sécurisée avec chiffrement des données en transit et au repos.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8">4. Propriété intellectuelle</h2>
      <p>
        L'ensemble du contenu du site KoobNaaba (textes, images, graphismes, logo, icônes, logiciels) 
        est la propriété exclusive de KoobNaaba ou de ses partenaires et est protégé par les lois 
        burkinabè et internationales relatives à la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie 
        du contenu est strictement interdite.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8">5. Données personnelles</h2>
      <p>
        Conformément à la loi n°001-2021/AN du 30 mars 2021 portant protection des personnes à l'égard 
        du traitement des données à caractère personnel au Burkina Faso, et au Règlement de l'UEMOA 
        relatif à la protection des données personnelles, vous disposez d'un droit d'accès, de rectification, 
        de suppression et d'opposition concernant vos données personnelles.
      </p>
      <p>
        Pour exercer ces droits, contactez-nous à : <a href="mailto:dpo@koobnaaba.com" className="text-primary">dpo@koobnaaba.com</a>
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8">6. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit burkinabè. En cas de litige, 
        les tribunaux de Ouagadougou seront seuls compétents.
      </p>
    </main>
  </div>
);

export default MentionsLegales;
