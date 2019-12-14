let map = [];
let info = [];
let move_color = "white"; //показывает чей сейчас ход, черных или белых
let move_from_x;
let move_from_y;
let pawn_attack_x = -1; //координаты битого поля
let pawn_attack_y = -1;
let from_figure; //какой фигурой пошли - нужно знать глобально, чтобы можно было сделать шаг назад если шах
let to_figure;
let possible_moves = 0;
let save_pawn_x = -1;
let save_pawn_y = -1;
let save_pawn_figure = " ";

function init_map() { //фигуры
    map = [
        ["R", "P", " ", " ", " ", " ", "p", "r"],
        ["N", "P", " ", " ", " ", " ", "p", "n"],
        ["B", "P", " ", " ", " ", " ", "p", "b"],
        ["Q", "P", " ", " ", " ", " ", "p", "q"],
        ["K", "P", " ", " ", " ", " ", "p", "k"],
        ["B", "P", " ", " ", " ", " ", "p", "b"],
        ["N", "P", " ", " ", " ", " ", "p", "n"],
        ["R", "P", " ", " ", " ", " ", "p", "r"]
    ]
}

function init_info() { //подсветка ходов
    //1 - from
    //2 - to
    info = [
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "]
    ]
}

function can_move(sx, sy, dx, dy) {
    //если ход фигуры совпадает с фигурой которой мы хотим пойти
    if(!can_move_from(sx, sy)) return false; //можем ли пойти этой фишурой
    //если клетка куда мы ъотим пойти пустая или это клетка соперника
    if(!can_move_to(dx, dy)) return false;//можем ли в теории перейти фигурой на ту клетку, по которой кликнули
    //если мы ходим правильными фигурами и не на себя(2 верхние провкри), то проверяем правила хода для этой фигуры
    if(!is_correct_move(sx, sy, dx, dy)) return false;
    if(is_check_after_move(sx, sy, dx, dy)) return false; //если нет шаха
    return true;
}

function is_check_after_move(sx, sy, dx, dy) {
	move_figure(sx, sy, dx, dy); //позволить игроку сделать ход
	turn_move(); //искусственно поменяли текущий ход на ход соперника, чтобы корректна отработала функция is_correct_move
	
	const check = is_check();
	
	turn_move(); //после того как все сделали возвращаем ход тем кто и ходил изначально
    back_figure(sx, sy, dx, dy); //отменяем ход(мы делали ход только для провперки на шах)
	
	return check;
}

function is_check() { //шах ли тем фигурам которые сейчас ходят
	const king = find_figure(move_color == 'white' ? 'k' : 'K'); //найти координаты короля

	for(let x = 0; x < 8; x++) { //перебрать все фигуры соперника
		for(let y = 0; y < 8; y++) {
			if(get_color(x, y) == move_color) {
				if(is_correct_move(x, y, king.x, king.y)) return true; //узнать может ли каждая фигура пойти на клетку нашего короля(съесть его)
			}
		}
	}
	return false;
}

function is_checkmate() {
	//мат это когда шах и ходить некуда
	if(!is_check()) return false; //если нет шаха то и нет мата
	return possible_moves == 0; //если кол-во ходов равно 0, то это мат
}

function is_stalemate() {
	if(is_check()) return false; //если шах есть то пата быть не может
	return possible_moves == 0; //во время пата ходов нет
}

function find_figure(figure) {
    for(let x = 0; x < 8; x++) {
        for(let y = 0; y < 8; y++) {
            if(map[x][y] == figure) return {x: x, y: y};
        }
    }
    return false;
}

function is_correct_move(sx, sy, dx, dy) {
    const figure = map[sx][sy]; //узнаем какая иугра находится в этой клетке
    if(is_king(figure)) return is_correct_kink_move(sx, sy, dx, dy);
    if(is_queen(figure)) return is_correct_queen_move(sx, sy, dx, dy);
    if(is_bishop(figure)) return is_correct_bishop_move(sx, sy, dx, dy);
    if(is_knight(figure)) return is_correct_knight_move(sx, sy, dx, dy);
    if(is_rook(figure)) return is_correct_rook_move(sx, sy, dx, dy);
    if(is_pawn(figure)) return is_correct_pawn_move(sx, sy, dx, dy);

    return false;
}

function is_correct_line_delta(delta_x, delta_y, figure) {
    if(is_rook(figure)) return is_correct_rook_delta(delta_x, delta_y);
    if(is_bishop(figure)) return is_correct_bishop_delta(delta_x, delta_y);
    if(is_queen(figure)) return is_correct_queen_delta(delta_x, delta_y);

    return false;
}

function is_correct_rook_delta(delta_x, delta_y) {
    return Math.abs(delta_x) + Math.abs(delta_y) == 1; //1 будет получаться только тогда, когда мы перемещаемся по одному направлению - вверх вниз влево вправо
}

function is_correct_bishop_delta(delta_x, delta_y) {
    return Math.abs(delta_x) + Math.abs(delta_y) == 2;
}

function is_correct_queen_delta(delta_x, delta_y) {
    return true;
}

function is_correct_line_move(sx, sy, dx, dy, figure) {
    let delta_x = Math.sign(dx - sx);
    let delta_y = Math.sign(dy - sy);

    if(!is_correct_line_delta(delta_x, delta_y, figure)) return false;

    do{
        //в цикле сдвигаем координаты до той точки, куда хочет пойти ладья, и проверям будет ли встерчмться какие то фигуры на этом пути
        sx += delta_x; //не учиытваем клетку, в которой изначально стоялаа ладья, потом что сама на себя она пойти не может
        sy += delta_y;

        if(sx == dx && sy == dy) return true; //если мы дошли до финала - до той точки, куда хочет пойти ладья
        //если пути по которому мы идем к финальной точке(куда хотела пойти ладья) упремся в какую то фигуру, то не даем ладье пойти - через фигуру нельзя перепрыгнуть
    }
    while(is_empty(sx, sy));

    return false; //если мы вышли из цыкла, то мы вышли за пределы доски - вернем false
}

function is_correct_kink_move(sx, sy, dx, dy) {
    if(Math.abs(dx - sx) <= 1 && Math.abs(dy - sy) <= 1) return true;
    return false;
}
function is_correct_queen_move(sx, sy, dx, dy) {
    return is_correct_line_move(sx, sy, dx, dy, 'Q');
}
function is_correct_bishop_move(sx, sy, dx, dy) {
    return is_correct_line_move(sx, sy, dx, dy, 'B');
}
function is_correct_knight_move(sx, sy, dx, dy) { //конь
    if(Math.abs(dx - sx) == 1 && Math.abs(dy - sy) == 2) return true;
    if(Math.abs(dx - sx) == 2 && Math.abs(dy - sy) == 1) return true;
    return false;
}
function is_correct_rook_move(sx, sy, dx, dy) { //ладья
    //Math.sign вернет либо 1 либо -1 либо 0, в зависимости ото того передаем мы положитедное число ии отриц
    //если двигаемся вправо, то дельта будет расти на 1
    // если двигаемся влево то дельта будет убывать на 1
    return is_correct_line_move(sx, sy, dx, dy, 'R');
}

function is_empty(x, y) { //пустая ли клетка
    if(!on_map(x, y)) return false;
    return map[x][y] == " ";
}

function on_map(x, y) { //нужно провнрить не вышли ли мы за пределы доски
    return (x >= 0 && x <= 7 && y >= 0 && y <= 7);
}

function is_correct_pawn_move(sx, sy, dx, dy) {
    if(sy < 1 || sy > 6) return false;

    if(get_color(sx, sy) == "white") return is_correct_sign_pawn_move(sx, sy, dx, dy, 1);//правила хода для белой пешки
    if(get_color(sx, sy) == "black") return is_correct_sign_pawn_move(sx, sy, dx, dy, -1);//правила хода для черной пешки
    return false;
}

function is_correct_sign_pawn_move(sx, sy, dx, dy, sign) {
    if(is_pawn_passant(sx, sy, dx, dy, sign)) return true;
    if(!is_empty(dx, dy)) { //если бьем фигуру
        if(Math.abs(dx - sx) != 1) return false; //во вермя бития x может изменитсять только 1 влево иил вправо(тк бьем на искосок)
        return dy - sy == sign; //во время бития y может изменять только на 1 вверх
    }
    if(dx != sx) return false; //если ходим не по одной вертикале вверх
    if(dy - sy == sign) return true; //пешки могут перемещаться только на 1 клетку вверх
    if(dy - sy == sign*2) { //если пешка пошла на 2 хода, то проверяем что она должна находиться на своей начальной позиции и при этом перед ней не должно быть никакх фигур(тк она ен может черех них перепрыгнуть)
        if(sy != 1 && sy != 6) return false;
        return is_empty(sx, sy + sign);
    }
    return false;
}

function is_pawn_passant(sx, sy, dx, dy, sign) {
    if(!(dx == pawn_attack_x && dy == pawn_attack_y)) return false; //значит мы не попали на битое поле
    if(sign == 1 && sy != 4) return false; //только с 4 горизонтали вохможно взятие на проходе для белых
    if(sign == -1 && sy != 3) return false; //только с 3 горизонтали вохможно взятие на проходе для черных
    if(dy - sy != sign) return false;
    return (Math.abs(dx - sx) == 1); //либо шаг влево либо шаг вправо
}

function is_king(figure) {return figure.toUpperCase() == "K";}
function is_queen(figure) {return figure.toUpperCase() == "Q";}
function is_bishop(figure) {return figure.toUpperCase() == "B";}
function is_knight(figure) {return figure.toUpperCase() == "N";}
function is_rook(figure) {return figure.toUpperCase() == "R";}
function is_pawn(figure) {return figure.toUpperCase() == "P";}

function mark_moves_from() { //поставить 1 в карту подсветки - откуда идем
    possible_moves = 0; //сбрасываем кол-во ходов в прерыдщуей ситуации
	init_info();
    for(let sx = 0; sx < 8; sx++) {
        for(let sy = 0; sy < 8; sy++) {
            for(let dx = 0; dx < 8; dx++) {
                for(let dy = 0; dy < 8; dy++) {
                    //если с этой клетки можно пойти на ту клетку
                    if(can_move(sx, sy, dx, dy)) {
						info[sx][sy] = "1"; //если с этой клетки можно куда то пойти, то ставим в подстветку 1
						possible_moves++; //кол-во ходо всего
					}
                }
            }
        }
    }
}

function mark_moves_to() { //поставить 2 в карту подсветки - куда можно пойти
    init_info();
    for(let x = 0; x < 8; x++) {
        for(let y = 0; y < 8; y++) {
            if(can_move(move_from_x, move_from_y, x, y)) info[x][y] = "2"; //если мы можем пойти на эту клетку то в подстветку ставим 2
        }
    }
}

function can_move_to(x, y) {
    if(map[x][y] === " ") return true; //если клетка пустая, значит на нее можно пойти
    return get_color(x, y) !== move_color; //если цвет ходящей фигуры не совпадает с цветом фигур соперника
}

function can_move_from(x, y) {
    if(!on_map(x, y)) return false; //если мы пытаемся пойти не с поля, то нельзя
    //если цвет ходячей фигуры совпадает с цветом фигур, которые сейчас должны хожитб, то true
    return get_color(x, y) === move_color;
}

function get_color(x, y) {
    //если буква фигуры большая значит белая, если малеькая то черная
    const figure = map[x][y];
    if(figure === " ") return "";
    return (figure.toUpperCase() === figure) ? "white" : "black";
}

function figure_to_html(figure) {
    switch (figure) {
        case "K": return "&#9812;";
        case "Q": return "&#9813;";
        case "R": return "&#9814;";
        case "B": return "&#9815;";
        case "N": return "&#9816;";
        case "P": return "&#9817;";
        case "k": return "&#9818;";
        case "q": return "&#9819;";
        case "r": return "&#9820;";
        case "b": return "&#9821;";
        case "n": return "&#9822;";
        case "p": return "&#9823;";
        default: return "&nbsp;";
    }
}

function show_map() {
    let html = "<table>";
    for(let y = 7; y >= 0; y--) {
        html += "<tr>";
        html += `<td class='coord_y'>${y}</td>`;
        let className = "";
        for(let x = 7; x >= 0; x--) {
            if(info[x][y] == " ") className = (x + y) % 2? 'white': 'black';
            else className = info[x][y] == "1" ? "red" : "green";
            html += `<td onclick='click_box(${x}, ${y})' class='${className}' data-x='${x}' data-y='${y}'>
                    <div data-x='${x}' data-y='${y}'>${figure_to_html(map[x][y])}</div>                
            </td>`;
        }
        html += "</tr>";
    }
    html += "<tr>";
    html += "<td class='coord_x'></td>";
    for(let i = 0; i < 8; i++) html += `<td class="coord_x">${i}</td>`;
    html += "</tr>";
    html += "</table>";
    document.getElementById('board').innerHTML = html;
	show_info();
}

const click_box = function(x, y){
    if(info[x][y] === '1') click_box_from(x, y);
    else if(info[x][y] === '2') click_box_to(x, y);
}

function click_box_from(x, y) {
    move_from_x = x;
    move_from_y = y;
    mark_moves_to(x, y); //в карте подсветок показываем куда можно ходить
    show_map(); //после ихменения карты подстветки перерисовываем доску
}

function click_box_to(x, y) {
    move_figure(move_from_x, move_from_y, x, y);

    promote_pawn(from_figure, x, y); //узнаем была ли это пешка, и была ли она черной или белой
    
    check_pawn_attack(from_figure, x, y);

    turn_move(); //смена хода -- сначала меняем ход, а потом меняем подствеку - в которой определится кто может ходить
    mark_moves_from(); //обновить подствеку после хода
    show_map();
}

function move_pawn_attack(from_figure, x, y) {
	if(is_pawn(from_figure)) { //если взяли пешку на проход, то пешку сопреника надо убрать(мы ее типа съели)
        if(x == pawn_attack_x && y == pawn_attack_y) {
			let new_y = move_color == 'white' ? y - 1 : y + 1; //белые / черные
			save_pawn_figure = map[x][new_y]; //сохранили пешку, которая там была
			save_pawn_x = x;
			save_pawn_y = y;
			map[x][y] = " ";
        }
    }
}

function back_pawn_attack() {
	if(save_pawn_x == -1) return; 
	//если взяли пешку на проход, то пешку сопреника надо убрать(мы ее типа съели)
	map[save_pawn_x][save_pawn_y] = save_pawn_figure;
}

function move_figure(sx, sy, dx, dy) {
    from_figure = map[sx][sy];
    to_figure = map[dx][dy];

    //map[x][y] = new_figure ? new_figure : from_figure; //ставим фигуру которой пошли из старых координат в новые, либо заменяем на новую, если дошли пешкой до конца
    map[dx][dy] = from_figure;
    map[sx][sy] = " "; // убираем фигуру из старых координат, тк она уже стоит в новых
	
	move_pawn_attack(from_figure, dx, dy);
}

function back_figure(sx, sy, dx, dy) {
    map[sx][sy] = from_figure;
    map[dx][dy] = to_figure;
	
	back_pawn_attack();
}

function promote_pawn(from_figure, x, y) {
    if(!is_pawn(from_figure)) return false; //убедились что мы сходили пешкой
    if(!(y == 7 || y == 0)) return false; //убедились что мы этой пешкой дошли до конца доски
    let new_figure;
    do {
        new_figure = prompt("Выберите фигуру: Q, R, B, N", 'Q');
    } while (!(is_queen( new_figure) || is_rook(new_figure) || is_bishop(new_figure) || is_knight(new_figure)));

    if(move_color == 'white') from_figure = new_figure.toUpperCase(); //поменяли пешку на ферзя
    else if(move_color == 'black') from_figure = new_figure.toLowerCase();

    map[x][y] = from_figure;
}

function check_pawn_attack(from_figure, x, y) {
    pawn_attack_x = -1;
    pawn_attack_y = -1;//сбрасываем после каждого хода
	
	save_pawn_x = -1;
	
    if(is_pawn(from_figure)) { //если это пешка
        if(Math.abs(y - move_from_y)) { //и она пошла на 2 клетки
            pawn_attack_x = move_from_x; // координата клетки, через которую пешка перепрыгнула, когда ходила на 2 клетки вперед в самом начале
            pawn_attack_y = (move_from_y + y) / 2;
        }
    }
}

function turn_move() {
    move_color = move_color === 'white' ? 'black' : 'white'
}

function show_info() {
	let html = `Ходят: ${move_color}`;
	turn_move();
	if(is_checkmate()) html += ' Мат';
	if(is_stalemate()) html += ' Пат';
	if(is_check()) html += ' Шах';
	turn_move();
	document.getElementById('info').innerHTML = html;
}

function start() {
    init_map();
    mark_moves_from();
    show_map();
}
start();