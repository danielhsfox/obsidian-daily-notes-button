/**
 * Dynamic Note Creator - Obsidian Plugin
 * Copyright (c) 2026 danielhsfox
 * @license MIT
 */
import { App, Plugin, Notice, TFile } from 'obsidian';

// Configuración del plugin (simplificada, sin opciones de días)
interface DailyNotesButtonPluginSettings {
	// Vacío por ahora, pero lo mantenemos para futuras expansiones
}

const DEFAULT_SETTINGS: DailyNotesButtonPluginSettings = {}

export default class DailyNotesButtonPlugin extends Plugin {
	settings: DailyNotesButtonPluginSettings;

	// Mapa de días multi-idioma
	private dayMap: Record<string, number> = {
		// Español (una letra)
		'd': 0,  // domingo
		'l': 1,  // lunes
		'm': 2,  // martes
		'x': 3,  // miércoles
		'j': 4,  // jueves
		'v': 5,  // viernes
		's': 6,  // sábado
		
		// Inglés (dos letras)
		'su': 0,  // sunday
		'mo': 1,  // monday
		'tu': 2,  // tuesday
		'we': 3,  // wednesday
		'th': 4,  // thursday
		'fr': 5,  // friday
		'sa': 6,  // saturday
		
		// Inglés (tres letras)
		'sun': 0,
		'mon': 1,
		'tue': 2,
		'wed': 3,
		'thu': 4,
		'fri': 5,
		'sat': 6,
		
		// Inglés (completo)
		'sunday': 0,
		'monday': 1,
		'tuesday': 2,
		'wednesday': 3,
		'thursday': 4,
		'friday': 5,
		'saturday': 6,
		
		// Español (completo, por si acaso)
		'domingo': 0,
		'lunes': 1,
		'martes': 2,
		'miércoles': 3,
		'miercoles': 3,  // sin acento
		'jueves': 4,
		'viernes': 5,
		'sábado': 6,
		'sabado': 6,  // sin acento
	};

	async onload() {
		await this.loadSettings();

		// Registrar el procesador de bloques de código
		this.registerMarkdownCodeBlockProcessor('daily-notes-button', (source, el, ctx) => {
			this.createButtonBlock(source, el, ctx);
		});

		console.log('Daily Notes Button plugin loaded');
	}

createButtonBlock(source: string, container: HTMLElement, ctx: any) {
	const config = this.parseConfig(source);
	
	const buttonContainer = container.createDiv({ cls: 'daily-notes-button-container' });
	
	const button = buttonContainer.createEl('button', {
		cls: 'daily-notes-button',
		text: config.title || this.t('button.defaultText')
	});
	
	button.addEventListener('click', async (event: MouseEvent) => {
		// Pasar el evento para detectar si Ctrl está presionado
		await this.handleButtonClick(button, config, event);
	});
}

	parseConfig(source: string) {
		const config: {
			title: string | null;
			pathTemplate: string | null;
			folder: string | null;
		} = {
			title: null,
			pathTemplate: null,
			folder: null
		};

		const lines = source.split('\n').filter(line => line.trim());
		
		lines.forEach(line => {
			if (line.startsWith('title:')) {
				config.title = line.replace('title:', '').trim();
			} else if (line.startsWith('pathTemplate:')) {
				config.pathTemplate = line.replace('pathTemplate:', '').trim() + '.md';
			} else if (line.startsWith('folder:')) {
				config.folder = line.replace('folder:', '').trim();
			}
		});

		return config;
	}

	getFormattedCurrentDate(): string {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	/**
	 * Obtiene el número de día (0=domingo, 6=sábado)
	 * Obsidian usa el estándar donde 0=domingo
	 */
	getCurrentDayNumber(): number {
		const moment = (window as any).moment();
		return moment.day(); // 0=domingo, 1=lunes, ..., 6=sábado
	}

	/**
	 * Parsea una cadena de días en cualquier formato a números
	 * @param dayStr Cadena como "l,m,x" o "mon,tue,wed" o "monday,tuesday"
	 * @returns Array de números de día (0-6)
	 */
	parseDayString(dayStr: string): number[] {
		const days = dayStr.split(',').map(d => d.trim().toLowerCase());
		const result: number[] = [];
		
		for (const day of days) {
			// Verificar que el día existe en el mapa
			const dayNumber = this.dayMap[day];
			if (dayNumber !== undefined) {
				result.push(dayNumber);
			}
			// Si es un número, lo interpretamos directamente
			else if (/^\d+$/.test(day)) {
				const num = parseInt(day, 10);
				if (num >= 0 && num <= 6) {
					result.push(num);
				}
			}
		}
		
		// Eliminar duplicados y ordenar
		return [...new Set(result)].sort();
	}

	/**
	 * Verifica si una línea debe ser visible según los días configurados
	 * @param line Línea de texto a evaluar
	 * @returns true si la línea debe mostrarse, false si debe ocultarse
	 */
	shouldShowLine(line: string): boolean {
		// Buscar patrón [l,m,x] o [mon,tue,wed] al final de la línea
		const dayPattern = /\[([^\]]+)\]\s*$/;
		const match = line.match(dayPattern);
		
		if (!match) {
			// Si no tiene especificación de días, siempre se muestra
			return true;
		}
		
		// Extraer los días permitidos y parsearlos
		const daySpec = match[1];
		// Asegurarnos de que daySpec es string
		if (typeof daySpec !== 'string') {
			return true;
		}
		
		const allowedDays = this.parseDayString(daySpec);
		
		if (allowedDays.length === 0) {
			// Si no se pudo parsear ningún día, mostrar la línea
			return true;
		}
		
		// Obtener el día actual
		const currentDay = this.getCurrentDayNumber();
		
		// Verificar si el día actual está en los permitidos
		return allowedDays.includes(currentDay);
	}


	/**
	 * Procesa el contenido eliminando líneas que no deben mostrarse según los días configurados
	 * @param content Contenido original
	 * @returns Contenido filtrado
	 */
	processConditionalLines(content: string): string {
		const lines = content.split('\n');
		const processedLines: string[] = [];
		
		for (const line of lines) {
			// Preservar líneas vacías
			if (line.trim() === '') {
				processedLines.push(line);
				continue;
			}
			
			// Verificar si la línea debe mostrarse
			if (this.shouldShowLine(line)) {
				// Si debe mostrarse, eliminar el patrón [días] de la línea
				const cleanedLine = line.replace(/\s*\[[^\]]+\]\s*$/, '');
				processedLines.push(cleanedLine);
			}
			// Si no debe mostrarse, no agregar la línea (se omite)
		}
		
		return processedLines.join('\n');
	}

	async processTemplaterCommands(content: string, fileName: string = '', destinationFolder: string = ''): Promise<string> {
		try {
			let processed = content;
			// Usar moment de Obsidian
			const moment = (window as any).moment();
			const currentDate = this.getFormattedCurrentDate();
			const dayOfWeek = moment.format("dddd").toLowerCase();
			
			// PRIMERO: Procesar líneas condicionales [días]
			processed = this.processConditionalLines(processed);
			
			// Procesar comando de pendientes de ayer (español)
			if (processed.includes('<% MI_LISTA_PENDIENTES_AYER %>')) {
				const pendingItems = await this.getPreviousDayPendingItems(destinationFolder);
				
				if (pendingItems && pendingItems.trim()) {
					processed = processed.replace('<% MI_LISTA_PENDIENTES_AYER %>', pendingItems);
				} else {
					processed = processed.replace(/^\s*<% MI_LISTA_PENDIENTES_AYER %>\s*$/gm, '');
				}
			}
			
			// Procesar comando de pendientes de ayer (inglés)
			if (processed.includes('<% YESTERDAY_PENDING_TASKS %>')) {
				const pendingItems = await this.getPreviousDayPendingItems(destinationFolder);
				
				if (pendingItems && pendingItems.trim()) {
					processed = processed.replace('<% YESTERDAY_PENDING_TASKS %>', pendingItems);
				} else {
					processed = processed.replace(/^\s*<% YESTERDAY_PENDING_TASKS %>\s*$/gm, '');
				}
			}
			
			// Reemplazos de Templater
			const replacements = [
				{
					regex: /<%[-_]?\s*tp\.date\.now\s*\(\s*["']([^"']+)["']\s*\)\s*[-_]?%>/g,
					replacement: (match: string, format: string) => moment.format(format)
				},
				{
					regex: /<%[-_]?\s*tp\.date\.now\s*\(\s*\)\s*[-_]?%>/g,
					replacement: currentDate
				},
				{
					regex: /<%[-_]?\s*tp\.file\.title\s*\(\s*\)\s*[-_]?%>/g,
					replacement: fileName || currentDate
				},
				{
					regex: /<%[-_]?\s*tp\.date\.weekday\s*\(\s*["']?([^"')]+)["']?\s*\)\s*[-_]?%>/g,
					replacement: dayOfWeek
				}
			];

			for (const replacement of replacements) {
				if (typeof replacement.replacement === 'function') {
					processed = processed.replace(replacement.regex, replacement.replacement as any);
				} else {
					processed = processed.replace(replacement.regex, replacement.replacement as string);
				}
			}

			// Reemplazos simples adicionales
			processed = processed.replace(/<%tp\.date\.now\(\)%>/g, currentDate);
			processed = processed.replace(/<%tp\.date\.now\(["']([^"']+)["']\)%>/g, (match, format) => moment.format(format));
			processed = processed.replace(/<%tp\.file\.title\(\)%>/g, fileName || currentDate);
			
			return processed;
		} catch (error) {
			console.error('Error processing Templater commands:', error);
			return content;
		}
	}

	async getPreviousDayPendingItems(destinationFolder: string = ''): Promise<string> {
		try {
			const moment = (window as any).moment();
			const yesterday = moment.subtract(1, 'days').format("YYYY-MM-DD");
			const yesterdayFileName = `${yesterday}.md`;
			
			// Construir ruta del archivo de ayer
			let yesterdayFilePath: string;
			if (destinationFolder && destinationFolder.trim()) {
				const cleanFolder = destinationFolder.replace(/^\/+|\/+$/g, '');
				yesterdayFilePath = `${cleanFolder}/${yesterdayFileName}`;
			} else {
				yesterdayFilePath = yesterdayFileName;
			}
			
			// Buscar la nota del día anterior
			const yesterdayNote = this.app.vault.getAbstractFileByPath(yesterdayFilePath);
			
			if (!yesterdayNote || !(yesterdayNote instanceof TFile)) {
				return '';
			}
			
			// Leer el contenido
			const content = await this.app.vault.read(yesterdayNote);
			
			if (!content || typeof content !== 'string') {
				return '';
			}
			
			// Extraer items no completados (ignorando los marcadores de días)
			const pendingItems = content
				.split('\n')
				.filter(line => {
					// Eliminar primero el marcador de días si existe para la detección
					const lineWithoutDays = line.replace(/\s*\[[^\]]+\]\s*$/, '');
					return lineWithoutDays.includes('- [ ] ') || 
						   lineWithoutDays.includes('* [ ] ') || 
						   lineWithoutDays.includes('+ [ ] ') ||
						   /^\s*[-*+]\s+\[[ ]\]/.test(lineWithoutDays);
				})
				.map(line => {
					// Limpiar el marcador de días antes de migrar
					return line.replace(/\s*\[[^\]]+\]\s*$/, '').trim();
				})
				.filter(line => line.length > 0);
			
			if (pendingItems.length === 0) {
				return '';
			}
			
			return pendingItems.join('\n');
			
		} catch (error) {
			console.error('Error in getPreviousDayPendingItems:', error);
			return '';
		}
	}

	async ensureFolderExists(folderPath: string): Promise<void> {
		try {
			const folder = this.app.vault.getAbstractFileByPath(folderPath);
			if (!folder) {
				await this.app.vault.createFolder(folderPath);
			}
		} catch (error) {
			console.error(`Error creating folder ${folderPath}:`, error);
		}
	}

async handleButtonClick(button: HTMLButtonElement, config: any, event?: MouseEvent): Promise<void> {
	const originalText = button.textContent;
	
	try {
		button.textContent = this.t('button.checking');
		button.disabled = true;

		if (!config.pathTemplate) {
			new Notice(this.t('error.missingTemplate'));
			return;
		}

		const currentDate = this.getFormattedCurrentDate();
		const fileName = `${currentDate}.md`;
		
		// Verificar plantilla
		const template = this.app.vault.getAbstractFileByPath(config.pathTemplate);
		if (!template || !(template instanceof TFile)) {
			new Notice(this.t('error.templateNotFound', config.pathTemplate));
			return;
		}

		// Determinar carpeta donde guardar la nota
		let destinationFolder: string;
		if (config.folder) {
			destinationFolder = config.folder;
		} else {
			const lastSlash = config.pathTemplate.lastIndexOf('/');
			destinationFolder = lastSlash > 0 ? config.pathTemplate.substring(0, lastSlash) : '';
		}

		// Construir ruta completa
		let newNotePath: string;
		if (destinationFolder) {
			newNotePath = `${destinationFolder}/${fileName}`;
			await this.ensureFolderExists(destinationFolder);
		} else {
			newNotePath = fileName;
		}

		// Leer y procesar plantilla
		let content = await this.app.vault.read(template);
		content = await this.processTemplaterCommands(content, currentDate, destinationFolder);

		// Verificar si ya existe
		const existingNote = this.app.vault.getAbstractFileByPath(newNotePath);
		
		// Determinar si debe abrir en nueva pestaña (Ctrl presionado)
		const openInNewTab = event?.ctrlKey || false;
		
		if (existingNote && existingNote instanceof TFile) {
			button.textContent = this.t('button.opening');
			
			// Abrir según la tecla Ctrl
			let leaf;
			if (openInNewTab) {
				// Abrir en nueva pestaña (derecha)
				leaf = this.app.workspace.getLeaf('tab');
			} else {
				// Abrir en la pestaña actual
				leaf = this.app.workspace.getLeaf(false);
			}
			
			await leaf.openFile(existingNote);
			new Notice(this.t('notice.opening', currentDate));
		} else {
			button.textContent = this.t('button.creating');
			const newNote = await this.app.vault.create(newNotePath, content);
			
			// Abrir según la tecla Ctrl
			let leaf;
			if (openInNewTab) {
				// Abrir en nueva pestaña (derecha)
				leaf = this.app.workspace.getLeaf('tab');
			} else {
				// Abrir en la pestaña actual
				leaf = this.app.workspace.getLeaf(false);
			}
			
			await leaf.openFile(newNote);
			new Notice(this.t('notice.created', currentDate));
		}
		
	} catch (error) {
		console.error("Error:", error);
		new Notice(this.t('error.general'));
	} finally {
		setTimeout(() => {
			button.textContent = originalText;
			button.disabled = false;
		}, 1500);
	}
}

	// Sistema de internacionalización simple
	t(key: string, ...args: any[]): string {
		const translations: Record<string, string> = {
			// Botón
			'button.defaultText': '📅 Go to my Daily Note',
			'button.checking': '📝 Checking...',
			'button.opening': '📖 Opening...',
			'button.creating': '✨ Creating...',
			
			// Errores
			'error.missingTemplate': '❌ Error: Missing pathTemplate',
			'error.templateNotFound': '❌ Template not found: {0}',
			'error.general': '❌ Error processing',
			
			// Notificaciones
			'notice.opening': '📖 Opening: {0}',
			'notice.created': '✨ Note created: {0}',
		};

		let translation = translations[key] || key;
		
		// Reemplazar argumentos
		args.forEach((arg, index) => {
			translation = translation.replace(`{${index}}`, arg);
		});
		
		return translation;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}