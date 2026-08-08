/* ========================================
   CONFIGURAÇÃO
======================================== */


const GITHUB_USER = "hanscastorp2000";

const GITHUB_REPO = "frombrazilwithlovestudio";


/*
Exemplo:

const GITHUB_USER = "hanscastorp2000";
const GITHUB_REPO = "frombrazilwithlovestudio";

*/



/* ========================================
   ELEMENTOS
======================================== */


const projectsList =
  document.querySelector("#projects-list");


const lightbox =
  document.querySelector("#project-lightbox");


const projectContent =
  document.querySelector("#project-content");


const closeButton =
  document.querySelector("#close-project");



/* ========================================
   CARREGAR PASTAS DO GITHUB
======================================== */


async function loadProjects() {

  try {

    const githubURL =
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/projects`;


    const response = await fetch(githubURL);


    if (!response.ok) {

      throw new Error(
        `GitHub API error: ${response.status}`
      );

    }


    const contents = await response.json();


    /*
    Apenas diretórios.

    Diretórios começando com _
    ficam escondidos.
    */

    const folders = contents.filter(item => {

      return (
        item.type === "dir" &&
        !item.name.startsWith("_")
      );

    });



    const projects = [];


    /*
    Procura project.json
    dentro de cada pasta.
    */

    for (const folder of folders) {

      try {

        const metadataResponse =
          await fetch(
            `projects/${folder.name}/project.json`
          );


        if (!metadataResponse.ok) {

          console.warn(
            `${folder.name}: project.json não encontrado`
          );

          continue;

        }


        const metadata =
          await metadataResponse.json();


        projects.push({

          folder: folder.name,

          title:
            metadata.title || folder.name,

          year:
            metadata.year || "",

          category:
            metadata.category || ""

        });


      }

      catch (error) {

        console.warn(
          `Não foi possível carregar ${folder.name}`,
          error
        );

      }

    }



    /*
    Ordenação:

    ano mais recente primeiro.

    Dentro do mesmo ano:
    ordem alfabética.
    */

    projects.sort((a, b) => {

      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;


      if (yearB !== yearA) {

        return yearB - yearA;

      }


      return a.title.localeCompare(b.title);

    });



    renderProjects(projects);

  }


  catch (error) {

    console.error(error);


    projectsList.innerHTML = `
      <div class="error">
        Unable to load projects.
      </div>
    `;

  }

}



/* ========================================
   CRIAR TABELA
======================================== */


function renderProjects(projects) {

  projectsList.innerHTML = "";


  projects.forEach(project => {

    const row =
      document.createElement("button");


    row.className = "project-row";


    /*
    Guardamos o nome da pasta
    no próprio botão.
    */

    row.dataset.folder =
      project.folder;


    const year =
      document.createElement("span");


    const title =
      document.createElement("span");


    const category =
      document.createElement("span");


    year.textContent =
      project.year;


    title.textContent =
      project.title;


    category.textContent =
      project.category;


    row.appendChild(year);

    row.appendChild(title);

    row.appendChild(category);


    row.addEventListener(
      "click",
      () => openProject(project.folder)
    );


    projectsList.appendChild(row);

  });

}



/* ========================================
   ABRIR PROJETO
======================================== */

async function openProject(folder) {

  try {

    /*
    CARREGA O HTML DO PROJETO
    */

    const response = await fetch(
      `projects/${folder}/content.html`
    );


    if (!response.ok) {
      throw new Error(
        "content.html não encontrado"
      );
    }


    const html = await response.text();


    projectContent.innerHTML = html;


    /*
    ABRE O LIGHTBOX
    */

    lightbox.classList.add("open");

    document.body.style.overflow = "hidden";

    lightbox.scrollTop = 0;


    /*
    CARREGA AUTOMATICAMENTE
    AS IMAGENS
    */

    await loadProjectGallery(folder);


    /*
    URL DO PROJETO
    */

    history.pushState(
      { project: folder },
      "",
      `#${folder}`
    );

  }

  catch (error) {

    console.error(error);

  }

}

async function loadProjectGallery(folder) {

  const gallery =
    projectContent.querySelector("[data-gallery]");


  /*
  Se este projeto não tiver
  uma galeria, simplesmente ignora.
  */

  if (!gallery) return;


  try {

    const githubURL =
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/projects/${folder}/images`;


    const response =
      await fetch(githubURL);


    if (!response.ok) {

      console.warn(
        `${folder}: pasta images não encontrada`
      );

      return;

    }


    const files =
      await response.json();


    /*
    Extensões reconhecidas
    */

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".avif"
    ];


    /*
    Seleciona apenas imagens
    */

    const images =
      files.filter(file => {

        if (file.type !== "file") {
          return false;
        }


        const name =
          file.name.toLowerCase();


        return imageExtensions.some(
          extension =>
            name.endsWith(extension)
        );

      });



    /*
    ORGANIZA PELO NOME
    */

    images.sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        {
          numeric: true,
          sensitivity: "base"
        }
      )
    );



    /*
    CRIA A GALERIA
    */

    images.forEach(image => {

      const figure =
        document.createElement("figure");


      figure.className =
        "image-full";


      const img =
        document.createElement("img");


      /*
      Usamos download_url retornado
      pelo próprio GitHub.
      */

      img.src =
        image.download_url;


      img.alt = "";


      img.loading =
        "lazy";


      figure.appendChild(img);

      gallery.appendChild(figure);

    });


  }

  catch (error) {

    console.error(
      `Erro ao carregar imagens de ${folder}`,
      error
    );

  }

}

/* ========================================
   FECHAR PROJETO
======================================== */

function closeProject() {

  lightbox.classList.remove("open");

  projectContent.innerHTML = "";

  document.body.style.overflow = "";

  history.pushState(
    {},
    "",
    window.location.pathname
  );
}


if (closeButton) {
  closeButton.addEventListener(
    "click",
    closeProject
  );
}


/* ESC também fecha */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      lightbox.classList.contains("open")
    ) {
      closeProject();
    }

  }
);


/* ========================================
   LINK DIRETO PARA PROJETO
======================================== */

async function openProjectFromURL() {

  const hash =
    window.location.hash.substring(1);

  if (!hash) return;

  await loadProjects();

  const projectButton =
    document.querySelector(
      `[data-folder="${CSS.escape(hash)}"]`
    );

  if (projectButton) {
    openProject(hash);
  }

}


/* ========================================
   INICIAR SITE
======================================== */

if (window.location.hash) {
  openProjectFromURL();
} else {
  loadProjects();
}
