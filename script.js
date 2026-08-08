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

    const response =
      await fetch(
        `projects/${folder}/content.html`
      );


    if (!response.ok) {

      throw new Error(
        "content.html não encontrado"
      );

    }


    const html =
      await response.text();


    projectContent.innerHTML =
      html;


    lightbox.classList.add("open");


    /*
    Impede a home de rolar
    enquanto o projeto está aberto.
    */

    document.body.style.overflow =
      "hidden";


    /*
    O lightbox sempre começa no topo.
    */

    lightbox.scrollTop = 0;


    /*
    Coloca o nome do projeto na URL,
    sem recarregar a página.
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



/* ========================================
   FECHAR PROJETO
======================================== */


function closeProject() {

  lightbox.classList.remove("open");


  projectContent.innerHTML = "";


  document.body.style.overflow = "";


  /*
  Remove #projeto da URL.
  */

  history.pushState(
    {},
    "",
    window.location.pathname
  );

}



closeButton.addEventListener(
  "click",
  closeProject
);



/*
ESC também fecha.
*/


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


  /*
  Primeiro espera os projetos
  serem carregados.
  */

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

}

else {

  loadProjects();

}
