
## Arenduspõhimõtted

Tallinna UIG front-end kood on arendatud lähtuvalt järgmistest põhimõtetest:

* •	Komponendipõhine, korduvaid UI elemente tuleks käsitleda kui ühtset komponenti - sama kood annab igal pool ühe ja sama tulemuse.
* Stiilide ja klassinimede kirjutamisel peab lähtuma [Block Element Modifier (BEM)](http://getbem.com/) loogikast
* Stiilid on kirjutatud [SCSS](https://sass-lang.com/) süntaksis
* Kood (html, scss, javascript) ja staatilised elemendid (assets) on jagatud komponendi põhiselt eraldi failideks.

Antud keskkonna genereerimiseks kasutatakse [Fractal](https://fractal.build/) raamistikku.

**UIG põhised klassid**

Komponentide parema demo eesmärgil on kasutusel **.uig-** prefiksiga klassid, 
mille stiilid on defineeritud **utils.css** failis. Neid klasse ja faile ei ole vaja komponentide kasutamisel lisada!



## Requirements

Arenduskeskkonna käivitamiseks ja rakenduse ehitamiseks on vajalik:

* [Node.js](https://nodejs.org/en/) v4.4.7+

### Paigaldamine
Rakenduse tööks vajalike lisamoodulite paigaldamine toimub:

**npm install**

## Käivitamine

Arenduskeskkond: **gulp dev**

Staatilise rakenduse genereerimine: **gulp**


## Gulp taskid

**default**

Vaikimis käivitatav task, mis:
* genereerib komponentide stiilidest ühtse css faili
* kombineerib “assets” failid (pildid, fondid, jms)
* ehitab Staatilise Fractal keskkonna

**dev**

Arenduseks mõeldud task, mis:
* genereerib komponentide stiilidest ühtse css faili
* kombineerib “assets” failid (pildid, fondid, jms)
* käivitab lokaalse Fractal rakenduse (http://localhost:3000)
* jälgib failide muudatus ja uuendab automaatselt brauserit

## Serverisse laadimine

Staatilise versiooni uuendamiseks tuleb:
* ehitada Gulp taskiga uus versioon: **gulp**
* laadida **build** kaustas olev sisu serverisse.