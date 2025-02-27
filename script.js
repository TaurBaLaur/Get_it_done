function sanitizeDate(date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
}

function getFormatedDate(date){
    return date.getFullYear()+'-'+(date.getMonth()+1).toString().padStart(2,'0')+'-'+date.getDate().toString().padStart(2,'0');
}

function setMinDeadline(){
    let date = new Date();
    document.getElementById('todo-deadline').value = getFormatedDate(date);
    document.getElementById('todo-deadline').min = getFormatedDate(date);
}

function closeAddTodoMenu() {
    document.getElementById('add-todo-menu').classList.remove('visible');
    document.getElementById('todo-title').value = '';
    document.getElementById('todo-deadline').value = '';
}

function deleteTodo(todo){
    todo.parentElement.parentElement.style.backgroundColor = getComputedStyle(todo).backgroundColor;
    todo.parentElement.parentElement.classList.add('clear');

    const index = [...todo.parentNode.parentNode.parentNode.children].indexOf(todo.parentNode.parentNode);
    
    todo.parentElement.parentElement.addEventListener('animationend', () => {
        document.getElementById(todo.parentElement.parentElement.parentElement.id).removeChild(todo.parentElement.parentElement);
    }, { once: true });

    fetch('update.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"index": index}),
    }).then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
    }).catch(error =>{
        console.error("Unable to fetch data:", error)
    });
    
}

function createTodo(todo, deadline, color='transparent'){
    return `<li style="background-color: ${color}">
                <div class="todo-text">
                    <span class="todo">${todo}</span><br>
                    <span class="todo-deadline">Deadline: ${deadline}</span>
                </div>
                <div class="todo-buttons">
                    <button class="delete-button" onclick="deleteTodo(this)"><img src="x-mark.svg"></button>
                    <button class="done-button" onclick="deleteTodo(this)"><img src="check-mark.svg"></button>
                </div
            </li`
}

function getTodos(){
    fetch("./todos.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data =>{
            displayTodos(data);
        })
        .catch(error =>{
            console.error("Unable to fetch data:", error)
        });
}

function displayTodos(todos){
    todos.forEach(todo => {
        let currentDate = new Date();
        sanitizeDate(currentDate);
        let todoDeadline = new Date(todo.deadline);
        todoDeadline.setHours(0);
        if(todoDeadline < currentDate){
            document.getElementById('todo-list').innerHTML += createTodo(todo.text,todoDeadline.toLocaleDateString(),'#fa6920');
        } else{
            document.getElementById('todo-list').innerHTML += createTodo(todo.text,todoDeadline.toLocaleDateString());
        }
    });
}

function openAddTodoMenu(event){
    setMinDeadline();
    document.getElementById('add-todo-menu').classList.add('visible');
    event.stopPropagation();
}

document.getElementById('add-button').addEventListener('click', (event)=>{
    openAddTodoMenu(event);
});

document.getElementById('add-todo-button').addEventListener('click', ()=>{
    let errors='';
    let todoTitle=document.getElementById('todo-title').value.trim();
    if(todoTitle.length===0){
        errors+='A todo must have a title!';
    }

    let todoDeadline;

    if(document.getElementById('todo-deadline').value){
        let currentDate = new Date();
        sanitizeDate(currentDate);
        todoDeadline = new Date(document.getElementById('todo-deadline').value);
        todoDeadline.setHours(0);
        if(todoDeadline < currentDate){
            if(errors.length){
                errors+='\n';
            }
            errors+="The deadline can not be set in the past!";
        }
    }else{
        if(errors.length){
            errors+='\n';
        }
        errors+='You must set the deadline!';
    }

    if(errors.length){
        alert(errors);
    } else{
        todoElement = {text:todoTitle,deadline:getFormatedDate(todoDeadline)};
        document.getElementById('todo-list').innerHTML+=createTodo(todoTitle,todoDeadline.toLocaleDateString());

        fetch('update.php', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(todoElement),
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
        }).catch(error =>{
            console.error("Unable to fetch data:", error)
        });

        closeAddTodoMenu();
    }
});

document.getElementById('close').addEventListener('click', closeAddTodoMenu);

document.addEventListener('click', (e) => {
    if (document.getElementById('add-todo-menu').classList.contains('visible') && e.target==document.getElementById('add-todo-menu')) {
        closeAddTodoMenu();
    }
});

window.addEventListener('load', getTodos);