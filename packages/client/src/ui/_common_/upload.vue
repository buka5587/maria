<template>
	<div class="mk-uploader _acrylic" :style="{ zIndex }">
		<ol v-if="uploads.length > 0">
			<li v-for="ctx in uploads" :key="ctx.id">
				<div
					class="img"
					:style="{ backgroundImage: `url(${ctx.img})` }"
				></div>
				<div class="top">
					<p class="name">
						<i :class="icon('ph-circle-notch fa-pulse')"></i
						>{{ ctx.name }}
					</p>
					<p class="status">
						<span
							v-if="ctx.progressValue === undefined"
							class="initing"
							>{{ i18n.ts.waiting }}<MkEllipsis
						/></span>
						<span v-if="ctx.progressValue !== undefined" class="kb"
							>{{
								String(
									Math.floor(ctx.progressValue / 1024),
								).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
							}}<i>KB</i> /
							{{
								String(
									Math.floor(ctx.progressMax / 1024),
								).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
							}}<i>KB</i></span
						>
						<span
							v-if="ctx.progressValue !== undefined"
							class="percentage"
							>{{
								Math.floor(
									(ctx.progressValue / ctx.progressMax) * 100,
								)
							}}</span
						>
					</p>
				</div>
				<progress
					:value="ctx.progressValue || 0"
					:max="ctx.progressMax || 0"
					:class="{
						initing: ctx.progressValue === undefined,
						waiting:
							ctx.progressValue !== undefined &&
							ctx.progressValue === ctx.progressMax,
					}"
				></progress>
			</li>
		</ol>
	</div>
</template>

<script lang="ts" setup>
import * as os from "@/os";
import { uploads } from "@/scripts/upload";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const zIndex = os.claimZIndex("high");
</script>

<style lang="scss" scoped>
.mk-uploader {
	position: fixed;
	inset-inline-end: 16px;
	inline-size: 260px;
	inset-block-start: 32px;
	padding-block: 16px;
	padding-inline: 20px;
	pointer-events: none;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	border-radius: 8px;
}
.mk-uploader:empty {
	display: none;
}
.mk-uploader > ol {
	display: block;
	margin: 0;
	padding: 0;
	list-style: none;
}
.mk-uploader > ol > li {
	display: grid;
	margin-block-start: 8px;
	margin-inline-end: 0;
	margin-block-end: 0;
	margin-inline-start: 0;
	padding: 0;
	block-size: 36px;
	inline-size: 100%;
	border-block-start: solid 8px transparent;
	grid-template-columns: 36px calc(100% - 44px);
	grid-template-rows: 1fr 8px;
	column-gap: 8px;
	box-sizing: content-box;
}
.mk-uploader > ol > li:first-child {
	margin: 0;
	box-shadow: none;
	border-block-start: none;
}
.mk-uploader > ol > li > .img {
	position: relative;
	display: block;
	background-size: cover;
	background-position: center center;
	grid-column: 1/2;
	grid-row: 1/3;
}
.mk-uploader > ol > li > .top {
	display: flex;
	grid-column: 2/3;
	grid-row: 1/2;
}
.mk-uploader > ol > li > .top > .name {
	display: block;
	padding-block-start: 0;
	padding-inline-end: 8px;
	padding-block-end: 0;
	padding-inline-start: 0;
	margin: 0;
	font-size: 0.8em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	flex-shrink: 1;
}
.mk-uploader > ol > li > .top > .name > i {
	margin-inline-end: 4px;
}
.mk-uploader > ol > li > .top > .status {
	display: block;
	margin-block-start: 0;
	margin-inline-end: 0;
	margin-block-end: 0;
	margin-inline-start: auto;
	padding: 0;
	font-size: 0.8em;
	flex-shrink: 0;
}
.mk-uploader > ol > li > .top > .status > .initing {
}
.mk-uploader > ol > li > .top > .status > .kb {
}
.mk-uploader > ol > li > .top > .status > .percentage {
	display: inline-block;
	inline-size: 48px;
	text-align: end;
}
.mk-uploader > ol > li > .top > .status > .percentage:after {
	content: "%";
}
.mk-uploader > ol > li > progress {
	display: block;
	background: transparent;
	border: none;
	border-radius: 4px;
	overflow: hidden;
	grid-column: 2/3;
	grid-row: 2/3;
	z-index: 2;
	inline-size: 100%;
	block-size: 8px;
}
.mk-uploader > ol > li > progress::-webkit-progress-value {
	background: var(--accent);
}
.mk-uploader > ol > li > progress::-webkit-progress-bar {
	//background: var(--accentAlpha01);
	background: transparent;
}
</style>
