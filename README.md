### Core :
- Page album
- Ajout d'albums
- Profil personnel
- Ajout au catalogue

## Priorités :

### Core Fonctionnalités

## Database restructure to do:
O Migrer les artistes sur un système d'ID
O Edition d'albums et d'artistes
O Profile page : charger liste des notes et reviews en prenant les infos albums depuis leur ID (infos à jour)

X Ajouter images albums et profil
O Ajouter image de profil dans les header et sur les pages albums
O RESTRUCTURER BASE DE DONNEES: stocker les infos albums sous leur ID, pour pouvoir y faire référence et obtenir directement des infos à jour (les albums mentionnés dans les listes, ratings, reviews... le seraient sous la forme d'array d'IDs, puis les infos seraient récoltées en effectuant une boucle sur ces IDs).
X Ajouter édition de pages (artistes et releases) avec le nom d'utilisateur
X Ajouter redirection automatique après submit
O Page profil
X Page album : charger les données à partir de l'ID plutôt qu'à partir du nom de l'album
X Rechercher dans la base de données
X ajouter les genres et un id aux albums, corriger affichage du genre
X Générer page artiste -> LIEN DYNAMIQUE
X Générer pages albums -> LIENS DYNAMIQUES
X Ajouter notes aux pages albums
X Ajouter notes au profil utilisateur
X Ajouter liens vers artistes et albums depuis les notes de la page profil
X Ajouter lien de retour à la page artiste depuis la page release
X Ajouter reviews aux pages albums
X Ajouter reviews aux pages utilisateur
X Arranger albums par dates
X Arranger notes par dates

## Second temps
### Fonctionnalités
O Implémenter listes
X Ajouter historique d'édition

### UI
O Ajouter liens vers profils des autres utilisateurs (cliquer sur les reviews et les ratings)
O Reviews de la page perso : ne prennent pas en compte les sauts de lignes
O Favicon et nom de page dynamique
O Afficher notes et reviews par page de 10 à la fois
O Afficher notes sous forme d'étoiles/demi-étoiles
O Ajouter notes en cliquant sur étoiles
O Ajouter tri des albums selon critères sur page de groupe
O Ajouter liste de toutes les notes, triées par note
O Faire UI d'écriture de review
O Affiner données artistes on submit
O Page profil
X Corriger calcul de l'average (recalculer à partir de la valeur rating de chaque object Rating)


### Comptes
O Vérifier email https://firebase.google.com/docs/auth/admin/email-action-links?hl=en#generate_password_reset_email_link
O Après création de compte, le nom d'utilisateur n'apparait pas dans le header (il faut se reconnecter)
O Vérification validité / disponibilité infos avant création de compte