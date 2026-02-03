Tout ajouter dans la zone de préparation (staging) :
powershell
git add .
Retirer de la zone de préparation (SANS supprimer les fichiers) ce qu'on ne veut pas pousser : C'est la commande magique restore --staged. Elle dit à Git : "Garde mes modifications sur mon PC, mais ne les mets pas dans le prochain commit".
powershell
git restore --staged src/app/logiciel src/app/admin src/app/api
Valider et Pousser :
powershell
git commit -m "Votre message"
git push
C'est ça le "truc" !

