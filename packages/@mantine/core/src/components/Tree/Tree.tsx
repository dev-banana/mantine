import { useEffect } from 'react';
import {
  Box,
  BoxProps,
  createVarsResolver,
  ElementProps,
  factory,
  Factory,
  getSpacing,
  MantineSpacing,
  StylesApiProps,
  useProps,
  useStyles,
} from '../../core';
import { TreeNode } from './TreeNode';
import { TreeController } from './use-tree';
import classes from './Tree.module.css';

export interface TreeNodeData {
  label: React.ReactNode;
  value: string;
  nodeProps?: Record<string, any>;
  children?: TreeNodeData[];
}

export interface RenderNodePayload {
  level: number;
  expanded: boolean;
  hasChildren: boolean;
  node: TreeNodeData;
  className: string;
  style: React.CSSProperties;
  onClick: (event: React.MouseEvent) => void;
}

export type RenderNode = (payload: RenderNodePayload) => React.ReactNode;

export type TreeStylesNames = 'root' | 'node' | 'subtree' | 'label';
export type TreeCssVariables = {
  root: '--level-offset';
};

export interface TreeProps extends BoxProps, StylesApiProps<TreeFactory>, ElementProps<'ul'> {
  /** Data used to render nodes */
  data: TreeNodeData[];

  /** Horizontal padding of each subtree level, key of `theme.spacing` or any valid CSS value, `'lg'` by default */
  levelOffset?: MantineSpacing;

  /** Determines whether tree node with children should be expanded on click, `true` by default */
  expandOnClick?: boolean;

  /** use-tree hook instance that can be used to manipulate component state */
  tree: TreeController;

  /** A function to render tree node label */
  renderNode?: RenderNode;
}

export type TreeFactory = Factory<{
  props: TreeProps;
  ref: HTMLUListElement;
  stylesNames: TreeStylesNames;
  vars: TreeCssVariables;
}>;

const defaultProps: Partial<TreeProps> = {
  expandOnClick: true,
};

const varsResolver = createVarsResolver<TreeFactory>((_theme, { levelOffset }) => ({
  root: {
    '--level-offset': getSpacing(levelOffset),
  },
}));

export const Tree = factory<TreeFactory>((_props, ref) => {
  const props = useProps('Tree', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    data,
    expandOnClick,
    tree,
    renderNode,
    ...others
  } = props;

  const getStyles = useStyles<TreeFactory>({
    name: 'Tree',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  useEffect(() => {
    tree.initialize(data);
  }, [data]);

  const nodes = data.map((node, index) => (
    <TreeNode
      key={node.value}
      node={node}
      getStyles={getStyles}
      selected={tree.selectedState}
      rootIndex={index}
      expandOnClick={expandOnClick}
      controller={tree}
      renderNode={renderNode}
    />
  ));

  return (
    <Box
      component="ul"
      ref={ref}
      {...getStyles('root')}
      {...others}
      role="tree"
      aria-multiselectable={tree.multiple}
      data-tree-root
    >
      {nodes}
    </Box>
  );
});

Tree.displayName = '@mantine/core/Tree';
Tree.classes = classes;
