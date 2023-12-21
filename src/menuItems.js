export const menuItems_login = [
  {
    title: 'Progress',
    url: 'progress'
  },
  {
    title: 'Deadlines',
    url: 'deadlines'
  },
  {
    title: 'List To Do',
    url: 'list_todo'
  },
  {
    title: 'Papers',
    url: 'papers'
  },
  {
    title: 'English',
    submenu: [
      {
        title: 'Speaking',
        submenu: [
          {
            title: "Paragraphs",
            url: "speaking_para"
          },
        ],
      },
    ],
  },
]

export const menuItems_nologin = [
  {
    title: 'Home',
    url: '/',
  }
]